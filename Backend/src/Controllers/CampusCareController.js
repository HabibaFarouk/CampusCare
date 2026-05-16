const prisma = require('../prismaClient');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { tokenBlacklist } = require('../middleware/auth');
require('dotenv').config();

const VALID_STATUSES = ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'FINISHED', 'FINALIZED', 'RESOLVED', 'CANCELLED'];
const VALID_CATEGORIES = ['MAINTENANCE', 'CLEANLINESS', 'SUSTAINABILITY'];

const STATUS_LABELS = {
  SUBMITTED: 'Issued',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'InProgress',
  FINISHED: 'Finished',
  FINALIZED: 'Finalized',
  RESOLVED: 'Finalized',
  CANCELLED: 'Cancelled',
};

const createAuditLog = async ({ ticketId, changedById, action, oldValue, newValue }) => {
  try {
    await prisma.auditLog.create({
      data: {
        ticketId,
        changedById,
        action,
        oldValue: oldValue || null,
        newValue: newValue || null,
      },
    });
  } catch (err) {
    console.error('AuditLog error:', err.message);
  }
};

const createNotification = async ({ userId, message }) => {
  if (!userId || !message) return;
  try {
    await prisma.notification.create({
      data: { userId, message },
    });
  } catch (err) {
    console.error('Notification error:', err.message);
  }
};

const formatStatusLabel = (status) => {
  const key = String(status || '').toUpperCase();
  return STATUS_LABELS[key] || status;
};

const notifyManagers = async ({ message, excludeUserId }) => {
  if (!message) return;
  try {
    const managers = await prisma.user.findMany({
      where: { role: 'FACILITY_MANAGER', isActive: true },
      select: { id: true },
    });
    const targets = managers.filter((m) => m.id !== excludeUserId);
    await Promise.all(
      targets.map((m) =>
        createNotification({
          userId: m.id,
          message,
        })
      )
    );
  } catch (err) {
    console.error('Manager notification error:', err.message);
  }
};

const notifyStatusChange = async ({ ticketId, newStatus, changedById, createdById, assignedToId }) => {
  const statusLabel = formatStatusLabel(newStatus);
  const message = `Issue #${ticketId} status changed to ${statusLabel}.`;
  const targets = [createdById, assignedToId].filter(
    (uid) => uid && uid !== changedById
  );

  await Promise.all(
    targets.map((uid) =>
      createNotification({
        userId: uid,
        message,
      })
    )
  );

  await notifyManagers({ message, excludeUserId: changedById });
};

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const unreadOnly = String(req.query.unreadOnly || '').toLowerCase() === 'true';
    const where = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(notifications);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.markNotificationRead = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid notification id' });
  }

  try {
    const userId = req.user.id;
    const result = await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });

    if (result.count === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    return res.status(200).json({ message: 'Notification marked as read' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return res.status(200).json({ message: 'All notifications marked as read', count: result.count });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

function parseRole(role) {
  if (role == null || role === '') return 'MEMBER';
  const r = String(role).trim().toUpperCase().replace(/[\s-]+/g, '_');
  const aliases = {
    CM: 'MEMBER',
    COMMUNITY: 'MEMBER',
    COMMUNITY_MEMBER: 'MEMBER',
    MEMBER: 'MEMBER',
    FM: 'FACILITY_MANAGER',
    FACILITY_MANAGER: 'FACILITY_MANAGER',
    MANAGER: 'FACILITY_MANAGER',
    WORKER: 'WORKER',
    W: 'WORKER',
    ADMIN: 'ADMIN',
  };
  const mapped = aliases[r] || r;
  const allowed = ['MEMBER', 'FACILITY_MANAGER', 'WORKER', 'ADMIN'];
  return allowed.includes(mapped) ? mapped : null;
}

// 1. Authentication & Authorization APIs
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '7d' }
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};


exports.registerUser = async (req, res) => {
  const { name, email, password, role: roleInput, phoneNumber } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, and password are required' });
  }

  const role = parseRole(roleInput);
  if (!role) {
    return res.status(400).json({ error: 'Invalid role. Use MEMBER, FACILITY_MANAGER, WORKER, or ADMIN' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        phoneNumber: phoneNumber || null,
      },
    });

    const { accessToken } = generateTokens(newUser);

    return res.status(201).json({
      message: 'Registration successful',
      accessToken,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phoneNumber: newUser.phoneNumber,
      },
    });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Email already registered' });
    }
    return res.status(400).json({ error: err.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.logout = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    tokenBlacklist.add(token);
  }
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logged out successfully' });
};


exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Generate reset token (valid 15 min)
        const resetToken = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        // In real system → send email
        // For milestone → return token
        return res.status(200).json({
            message: "Password reset token generated",
            resetToken
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    // 1. Validate input
    if (!token || !newPassword) {
        return res.status(400).json({
            error: "Token and new password are required"
        });
    }

    try {
        // 2. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 4. Update user password
        const updatedUser = await prisma.user.update({
            where: { id: decoded.id },
            data: { password: hashedPassword }
        });

        // 5. Success response
        return res.status(200).json({
            message: "Password has been reset successfully"
        });

    } catch (err) {
        // Token expired or invalid
        return res.status(400).json({
            error: "Invalid or expired reset token"
        });
    }
};

//2. Issue Management APIs
//2.1 For Community Members (CM)
exports.createIssue = async (req, res) => {
  const { title, description, category, location, imageUrl } = req.body;

  if (!title || !description || !category || !location) {
    return res.status(400).json({ error: 'title, description, category, and location are required' });
  }

  const cat = String(category).toUpperCase();
  if (!VALID_CATEGORIES.includes(cat)) {
    return res.status(400).json({ error: `Invalid category. Use one of: ${VALID_CATEGORIES.join(', ')}` });
  }

  try {
    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        category: cat,
        location,
        imageUrl: imageUrl || null,
        status: 'SUBMITTED',
        createdById: req.user.id,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    await createAuditLog({
      ticketId: ticket.id,
      changedById: req.user.id,
      action: 'ISSUE_CREATED',
      newValue: `status:${ticket.status}`,
    });

    const managers = await prisma.user.findMany({
      where: { role: 'FACILITY_MANAGER', isActive: true },
      select: { id: true },
    });
    await Promise.all(
      managers.map((m) =>
        createNotification({
          userId: m.id,
          message: `New issue submitted: ${ticket.title}`,
        })
      )
    );

    return res.status(201).json(ticket);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};




exports.getMyIssues = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { createdById: req.user.id };
    if (status) {
      const s = String(status).toUpperCase();
      if (!VALID_STATUSES.includes(s)) {
        return res.status(400).json({ error: `Invalid status. Use one of: ${VALID_STATUSES.join(', ')}` });
      }
      filter.status = s;
    }

    const data = await prisma.ticket.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.updateMyIssue = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid ticket id' });
  }

  const { title, description, category, location, imageUrl } = req.body;

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      select: { id: true, createdById: true, assignedToId: true, status: true },
    });

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    const role = String(req.user.role).toUpperCase();
    if (role !== 'ADMIN' && ticket.createdById !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to edit this ticket' });
    }

    if (ticket.assignedToId) {
      return res.status(400).json({ error: 'Assigned tickets cannot be edited' });
    }

    if (ticket.status !== 'SUBMITTED') {
      return res.status(400).json({ error: `Cannot edit ticket when status is ${ticket.status}` });
    }

    const updatePayload = {};
    if (title != null) updatePayload.title = String(title).trim();
    if (description != null) updatePayload.description = String(description).trim();
    if (location != null) updatePayload.location = String(location).trim();
    if (imageUrl !== undefined) updatePayload.imageUrl = imageUrl || null;

    if (category != null) {
      const cat = String(category).toUpperCase();
      if (!VALID_CATEGORIES.includes(cat)) {
        return res.status(400).json({ error: `Invalid category. Use one of: ${VALID_CATEGORIES.join(', ')}` });
      }
      updatePayload.category = cat;
    }

    if (Object.keys(updatePayload).length === 0) {
      return res.status(400).json({ error: 'No fields provided for update' });
    }

    const updated = await prisma.ticket.update({
      where: { id },
      data: updatePayload,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    await createAuditLog({
      ticketId: id,
      changedById: req.user.id,
      action: 'ISSUE_UPDATED',
      newValue: `fields:${Object.keys(updatePayload).join(',')}`,
    });

    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getIssueStatus = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid ticket id' });
  }

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        status: true,
        category: true,
        imageUrl: true,
        completionPhotoUrl: true,
        createdById: true,
        assignedToId: true,
        createdAt: true,
        updatedAt: true,
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    const role = String(req.user.role).toUpperCase();
    const uid = req.user.id;
    const canView =
      role === 'ADMIN' ||
      role === 'FACILITY_MANAGER' ||
      ticket.createdById === uid ||
      ticket.assignedToId === uid;

    if (!canView) {
      return res.status(403).json({ error: 'Access denied' });
    }

    return res.status(200).json(ticket);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.updateIssueStatus = async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid ticket id' });

  if (!status || !VALID_STATUSES.includes(String(status).toUpperCase())) {
    return res.status(400).json({ error: `Invalid status. Use one of: ${VALID_STATUSES.join(', ')}` });
  }

  try {
    const existing = await prisma.ticket.findUnique({
      where: { id },
      select: { id: true, status: true, createdById: true, assignedToId: true },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const nextStatus = String(status).toUpperCase();
    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: { status: nextStatus },
      include: {
        createdBy: { select: { name: true } },
        assignedTo: { select: { name: true } },
      },
    });

    await createAuditLog({
      ticketId: id,
      changedById: req.user.id,
      action: 'STATUS_CHANGED',
      oldValue: existing.status,
      newValue: nextStatus,
    });

    await notifyStatusChange({
      ticketId: id,
      newStatus: nextStatus,
      changedById: req.user.id,
      createdById: existing.createdById,
      assignedToId: existing.assignedToId,
    });

    return res.status(200).json(updatedTicket);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    return res.status(500).json({ error: err.message });
  }
};


exports.deleteIssue = async (req, res) => {
  const id = Number(req.params.id);
  
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid ticket id' });

  try {
    // Remove dependent records first to avoid foreign key constraint errors
    await prisma.$transaction([
      prisma.comment.deleteMany({ where: { ticketId: id } }),
      prisma.auditLog.deleteMany({ where: { ticketId: id } }),
      prisma.ticket.delete({ where: { id } }),
    ]);

    return res.status(200).json({ message: 'Issue deleted successfully' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    return res.status(500).json({ error: err.message });
  }
};

// 2.2 For Facility Managers (FM)
exports.getAllIssues = async (req, res) => {
  try {
    const { status, category, assignedToId, startDate, endDate } = req.query;
    const filter = {};
    if (status) {
      const s = String(status).toUpperCase();
      if (!VALID_STATUSES.includes(s)) {
        return res.status(400).json({ error: `Invalid status. Use one of: ${VALID_STATUSES.join(', ')}` });
      }
      filter.status = s;
    }
    if (category) {
      const c = String(category).toUpperCase();
      if (!VALID_CATEGORIES.includes(c)) {
        return res.status(400).json({ error: `Invalid category. Use one of: ${VALID_CATEGORIES.join(', ')}` });
      }
      filter.category = c;
    }
    if (assignedToId) {
      const raw = String(assignedToId).trim().toLowerCase();
      if (raw === 'unassigned' || raw === 'null') {
        filter.assignedToId = null;
      } else {
        const parsed = Number(assignedToId);
        if (!Number.isInteger(parsed) || parsed <= 0) {
          return res.status(400).json({ error: 'assignedToId must be a valid id or "unassigned"' });
        }
        filter.assignedToId = parsed;
      }
    }
    if (startDate || endDate) {
      const createdAt = {};
      if (startDate) {
        const parsedStart = new Date(startDate);
        if (Number.isNaN(parsedStart.getTime())) {
          return res.status(400).json({ error: 'startDate must be a valid date string' });
        }
        createdAt.gte = parsedStart;
      }
      if (endDate) {
        const parsedEnd = new Date(endDate);
        if (Number.isNaN(parsedEnd.getTime())) {
          return res.status(400).json({ error: 'endDate must be a valid date string' });
        }
        parsedEnd.setHours(23, 59, 59, 999);
        createdAt.lte = parsedEnd;
      }
      filter.createdAt = createdAt;
    }

    const tickets = await prisma.ticket.findMany({
      where: filter,
      include: {
        createdBy: { select: { name: true, email: true } },
        assignedTo: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const prioritized = [...tickets].sort((a, b) => {
      const aPriority = a.assignedToId ? 1 : 0;
      const bPriority = b.assignedToId ? 1 : 0;
      if (aPriority !== bPriority) return aPriority - bPriority;
      if (!a.assignedToId && !b.assignedToId) {
        const aSubmitted = a.status === 'SUBMITTED' ? 0 : 1;
        const bSubmitted = b.status === 'SUBMITTED' ? 0 : 1;
        if (aSubmitted !== bSubmitted) return aSubmitted - bSubmitted;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return res.status(200).json(prioritized);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getPrioritizedIssues = async (req, res) => {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { status: 'SUBMITTED' },
      orderBy: { createdAt: 'asc' },
      include: {
        createdBy: { select: { name: true, email: true } },
      },
    });
    return res.status(200).json(tickets);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.assignIssueToWorker = async (req, res) => {
  const id = Number(req.params.id);
  const { workerId } = req.body;
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid ticket id' });

  const wid = parseInt(workerId, 10);
  if (!Number.isInteger(wid) || wid <= 0) {
    return res.status(400).json({ error: 'Valid workerId is required' });
  }

  try {
    const existing = await prisma.ticket.findUnique({
      where: { id },
      select: { id: true, title: true, assignedToId: true, status: true, createdById: true },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const worker = await prisma.user.findFirst({
      where: { id: wid, role: 'WORKER' },
    });
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: { assignedToId: wid, status: 'ASSIGNED' },
      include: {
        createdBy: { select: { name: true } },
        assignedTo: { select: { name: true, email: true } },
      },
    });

    await createAuditLog({
      ticketId: id,
      changedById: req.user.id,
      action: 'ASSIGNED_WORKER',
      oldValue: `assignedTo:${existing.assignedToId || 'none'}`,
      newValue: `assignedTo:${wid}`,
    });

    await Promise.all([
      createNotification({
        userId: wid,
        message: `You have been assigned issue #${id}`,
      }),
      createNotification({
        userId: existing.createdById,
        message: `Your issue #${id} was assigned to a worker.`,
      }),
    ]);

    await notifyManagers({
      message: `Issue #${id} status changed to ${formatStatusLabel('ASSIGNED')}.`,
      excludeUserId: req.user.id,
    });
    return res.status(200).json(updatedTicket);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    return res.status(500).json({ error: err.message });
  }
};

exports.closeIssue = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid ticket id' });

  try {
    const existing = await prisma.ticket.findUnique({
      where: { id },
      select: { id: true, status: true, createdById: true, assignedToId: true },
    });
    if (!existing) return res.status(404).json({ error: 'Ticket not found' });

    if (existing.status === 'FINALIZED') {
      return res.status(400).json({ error: 'Ticket already finalized' });
    }
    if (existing.status !== 'FINISHED') {
      return res.status(400).json({ error: `Cannot finalize ticket when status is ${existing.status}` });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: { status: 'FINALIZED' },
    });

    await createAuditLog({
      ticketId: id,
      changedById: req.user.id,
      action: 'STATUS_CHANGED',
      oldValue: existing.status,
      newValue: 'FINALIZED',
    });

    await notifyStatusChange({
      ticketId: id,
      newStatus: 'FINALIZED',
      changedById: req.user.id,
      createdById: existing.createdById,
      assignedToId: existing.assignedToId,
    });
    return res.status(200).json(updatedTicket);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    return res.status(500).json({ error: err.message });
  }
};

// 2.3 For Workers (W)
exports.getAssignedIssues = async (req, res) => {
  try {
    const workerId = req.user && req.user.id;
    if (!workerId) return res.status(401).json({ error: 'Unauthorized' });

    const role = String(req.user.role).toUpperCase();
    const where =
      role === 'ADMIN' ? { assignedToId: { not: null } } : { assignedToId: workerId };

    const tickets = await prisma.ticket.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        imageUrl: true,
        completionPhotoUrl: true,
        status: true,
        createdAt: true,
        assignedTo: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(tickets);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.startIssue = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid ticket id' });

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      select: { id: true, status: true, assignedToId: true },
    });

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    const role = String(req.user.role).toUpperCase();
    if (role !== 'ADMIN' && ticket.assignedToId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to start this ticket' });
    }

    if (ticket.status === 'IN_PROGRESS') return res.status(400).json({ error: 'Ticket already started' });
    if (ticket.status === 'FINISHED') return res.status(400).json({ error: 'Ticket already finished' });
    if (ticket.status === 'FINALIZED') return res.status(400).json({ error: 'Ticket already finalized' });
    if (ticket.status !== 'ASSIGNED') {
      return res.status(400).json({ error: `Cannot start ticket when status is ${ticket.status}` });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: { status: 'IN_PROGRESS' },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        status: true,
        createdAt: true,
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    await createAuditLog({
      ticketId: id,
      changedById: req.user.id,
      action: 'STATUS_CHANGED',
      oldValue: ticket.status,
      newValue: 'IN_PROGRESS',
    });

    const existing = await prisma.ticket.findUnique({
      where: { id },
      select: { createdById: true, assignedToId: true },
    });

    await notifyStatusChange({
      ticketId: id,
      newStatus: 'IN_PROGRESS',
      changedById: req.user.id,
      createdById: existing?.createdById,
      assignedToId: existing?.assignedToId,
    });

    return res.status(200).json(updatedTicket);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.finishIssue = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid ticket id' });

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      select: { id: true, status: true, assignedToId: true },
    });

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    const role = String(req.user.role).toUpperCase();
    if (role !== 'ADMIN' && ticket.assignedToId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to finish this ticket' });
    }

    if (ticket.status === 'FINISHED') return res.status(400).json({ error: 'Ticket already finished' });
    if (ticket.status === 'FINALIZED') return res.status(400).json({ error: 'Ticket already finalized' });
    if (ticket.status !== 'IN_PROGRESS') {
      return res.status(400).json({ error: `Cannot finish ticket when status is ${ticket.status}` });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: { status: 'FINISHED' },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        status: true,
        createdAt: true,
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    await createAuditLog({
      ticketId: id,
      changedById: req.user.id,
      action: 'STATUS_CHANGED',
      oldValue: ticket.status,
      newValue: 'FINISHED',
    });

    const existing = await prisma.ticket.findUnique({
      where: { id },
      select: { createdById: true, assignedToId: true },
    });

    await notifyStatusChange({
      ticketId: id,
      newStatus: 'FINISHED',
      changedById: req.user.id,
      createdById: existing?.createdById,
      assignedToId: existing?.assignedToId,
    });

    return res.status(200).json(updatedTicket);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.addComment = async (req, res) => {
  const id = Number(req.params.id);
  const { text } = req.body;

  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid ticket id' });
  if (!text || text.trim() === '') return res.status(400).json({ error: 'Comment text is required' });

  try {
    const role = String(req.user.role).toUpperCase();
    if (role !== 'WORKER' && role !== 'FACILITY_MANAGER' && role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only workers, facility managers, or admins can perform this action' });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      select: { id: true, assignedToId: true },
    });

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    if (role !== 'ADMIN' && role !== 'FACILITY_MANAGER' && ticket.assignedToId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to comment on this ticket' });
    }

    const workerIdForComment = req.user.id;

    const comment = await prisma.comment.create({
      data: {
        text,
        ticketId: id,
        workerId: workerIdForComment,
      },
    });

    await createAuditLog({
      ticketId: id,
      changedById: req.user.id,
      action: 'COMMENT_ADDED',
      newValue: text,
    });

    const notifyTargets = [ticket.createdById, ticket.assignedToId].filter(
      (uid) => uid && uid !== req.user.id
    );
    await Promise.all(
      notifyTargets.map((uid) =>
        createNotification({
          userId: uid,
          message: `New comment on issue #${id}.`,
        })
      )
    );

    return res.status(201).json(comment);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.uploadCompletionPhoto = async (req, res) => {
  const id = Number(req.params.id);
  const { photoUrl } = req.body;

  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid ticket id' });
  if (!photoUrl || photoUrl.trim() === '') return res.status(400).json({ error: 'photoUrl is required' });

  try {
    const role = String(req.user.role).toUpperCase();
    if (role !== 'WORKER' && role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only workers or admins can perform this action' });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      select: { id: true, assignedToId: true },
    });

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    if (role !== 'ADMIN' && ticket.assignedToId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to upload photo for this ticket' });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: { completionPhotoUrl: photoUrl },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        status: true,
        completionPhotoUrl: true,
        createdAt: true,
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    await createAuditLog({
      ticketId: id,
      changedById: req.user.id,
      action: 'PHOTO_UPLOADED',
      newValue: photoUrl,
    });

    await createNotification({
      userId: ticket.createdById,
      message: `A completion photo was uploaded for issue #${id}.`,
    });

    return res.status(200).json(updatedTicket);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// 3.1 Facility Manager
exports.getWorkers = async (req, res) => {
  try {
    const workers = await prisma.user.findMany({
      where: { role: 'WORKER' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({
      message: 'Workers fetched successfully',
      data: workers,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getWorkerDetails = async (req, res) => {
  const userId = Number(req.params.id);
  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ message: 'Invalid worker id' });
  }

  try {
    const worker = await prisma.user.findFirst({
      where: { id: userId, role: 'WORKER' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    const [activeTasks, resolvedTasks] = await Promise.all([
      prisma.ticket.count({
        where: {
          assignedToId: userId,
          status: { in: ['ASSIGNED', 'IN_PROGRESS'] },
        },
      }),
      prisma.ticket.count({
        where: {
          assignedToId: userId,
          status: { in: ['FINISHED', 'FINALIZED'] },
        },
      }),
    ]);

    return res.status(200).json({
      ...worker,
      activeTasks,
      resolvedTasks,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.updateWorkerStatus = async (req, res) => {
  const userId = Number(req.params.id);
  const { status } = req.body;

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ message: 'Invalid worker id' });
  }

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  if (status !== 'active' && status !== 'inactive') {
    return res.status(400).json({ message: "Status must be 'active' or 'inactive'" });
  }

  try {
    const worker = await prisma.user.findFirst({
      where: { id: userId, role: 'WORKER' },
    });
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive: status === 'active' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    return res.status(200).json({
      message: `Worker ${userId} status updated to ${status}`,
      data: updated,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// 3.2 System Admin (User Management)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phoneNumber: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(users);
  } catch (error) {
    if (error.code === 'P2022' || String(error.message || '').includes('phoneNumber')) {
      try {
        const users = await prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        });
        return res.status(200).json(users);
      } catch (fallbackError) {
        return res.status(500).json({ error: 'Failed to fetch users' });
      }
    }
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
};

exports.updateUserStatus = async (req, res) => {
  const userId = Number(req.params.id);
  const { isActive } = req.body;

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ error: 'Invalid user id' });
  }

  if (typeof isActive !== 'boolean') {
    return res.status(400).json({ error: 'isActive must be boolean' });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    return res.status(200).json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: updatedUser,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(500).json({ error: 'Failed to update user status' });
  }
};


// ==========================================================
// NEW FEATURES: Dashboards, Workloads, and Admin Updates
// ==========================================================

// Dashboard summary (KPIs) - For FM & Admin
exports.getDashboardKPIs = async (req, res) => {
  try {
    const totalIssues = await prisma.ticket.count();
    let resolvedIssues = 0;
    try {
      resolvedIssues = await prisma.ticket.count({
        where: { status: { in: ['FINALIZED', 'RESOLVED'] } },
      });
    } catch (error) {
      resolvedIssues = await prisma.ticket.count({ where: { status: 'RESOLVED' } });
    }
    const submittedIssues = await prisma.ticket.count({ where: { status: 'SUBMITTED' } });
    const inProgressIssues = await prisma.ticket.count({ where: { status: 'IN_PROGRESS' } });
    const activeWorkers = await prisma.user.count({ where: { role: 'WORKER', isActive: true } });

    return res.status(200).json({
      totalIssues,
      resolvedIssues,
      submittedIssues,
      inProgressIssues,
      activeWorkers
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Worker availability/workload tracking - For FM
exports.getWorkerWorkloads = async (req, res) => {
  try {
    // Fetches all workers and counts how many active tickets they have
    const workers = await prisma.user.findMany({
      where: { role: 'WORKER', isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: {
            assignedTickets: {
              where: { status: { in: ['ASSIGNED', 'IN_PROGRESS'] } }
            }
          }
        }
      }
    });

    // Format the response to be easy to read
    const workloadData = workers.map(w => ({
      workerId: w.id,
      name: w.name,
      activeTasksCount: w._count.assignedTickets
    }));

    return res.status(200).json(workloadData);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Role update endpoint - For Admin only
exports.updateUserRole = async (req, res) => {
  const userId = Number(req.params.id);
  const { role } = req.body;

  if (!Number.isInteger(userId) || userId <= 0) return res.status(400).json({ error: 'Invalid user id' });

  const parsedRole = parseRole(role); // Using your existing helper function!
  if (!parsedRole) return res.status(400).json({ error: 'Invalid role provided' });

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: parsedRole },
      select: { id: true, name: true, role: true }
    });

    return res.status(200).json({ message: "Role updated successfully", user: updatedUser });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'User not found' });
    return res.status(500).json({ error: 'Failed to update user role' });
  }
};

exports.getIssueComments = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid ticket id' });

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      select: { id: true, createdById: true, assignedToId: true },
    });

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    const role = String(req.user.role).toUpperCase();
    const uid = req.user.id;
    const canView =
      role === 'ADMIN' ||
      role === 'FACILITY_MANAGER' ||
      ticket.createdById === uid ||
      ticket.assignedToId === uid;

    if (!canView) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const comments = await prisma.comment.findMany({
      where: { ticketId: id },
      include: {
        worker: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return res.status(200).json(comments);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.updateMyProfile = async (req, res) => {
  const { name, email } = req.body;
  if (!name && !email) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name ? { name: String(name).trim() } : {}),
        ...(email ? { email: String(email).trim().toLowerCase() } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    return res.status(200).json({ user: updatedUser });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Email already in use' });
    }
    return res.status(500).json({ error: 'Failed to update profile' });
  }
};

exports.deleteMyIssue = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid ticket id' });

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      select: { id: true, status: true, createdById: true, assignedToId: true },
    });

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    if (ticket.createdById !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this ticket' });
    }
    if (ticket.assignedToId || ticket.status !== 'SUBMITTED') {
      return res.status(400).json({ error: 'Only unassigned submitted issues can be deleted' });
    }

    // Remove dependent records first to avoid foreign key constraint errors
    await prisma.$transaction([
      prisma.comment.deleteMany({ where: { ticketId: id } }),
      prisma.auditLog.deleteMany({ where: { ticketId: id } }),
      prisma.ticket.delete({ where: { id } }),
    ]);

    return res.status(200).json({ message: 'Issue deleted' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};