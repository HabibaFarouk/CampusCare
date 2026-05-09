const prisma = require('../prismaClient');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { tokenBlacklist } = require('../middleware/auth');
require('dotenv').config();

const VALID_STATUSES = ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED'];
const VALID_CATEGORIES = ['MAINTENANCE', 'CLEANLINESS', 'SUSTAINABILITY'];

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
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};


exports.registerUser = async (req, res) => {
  const { name, email, password, role: roleInput } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, and password are required' });
  }

  const role = parseRole(roleInput);
  if (!role) {
    return res.status(400).json({ error: 'Invalid role. Use MEMBER, FACILITY_MANAGER, WORKER, or ADMIN' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    return res.status(201).json({ message: 'Registration successful' });
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
        createdById: req.user.id,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    return res.status(201).json(ticket);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};




exports.getMyIssues = async (req, res) => {
  try {
    const data = await prisma.ticket.findMany({
      where: { createdById: req.user.id },
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
    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: { status: String(status).toUpperCase() },
      include: {
        createdBy: { select: { name: true } },
        assignedTo: { select: { name: true } },
      },
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
    await prisma.ticket.delete({
      where: { id }
    });

    return res.status(200).json({ message: "Issue deleted successfully" });
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
    const { status, category } = req.query;
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

    const tickets = await prisma.ticket.findMany({
      where: filter,
      include: {
        createdBy: { select: { name: true, email: true } },
        assignedTo: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(tickets);
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
    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: { status: 'RESOLVED' },
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
    if (ticket.status === 'RESOLVED') return res.status(400).json({ error: 'Ticket already resolved' });
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

    if (ticket.status === 'RESOLVED') return res.status(400).json({ error: 'Ticket already resolved' });
    if (ticket.status !== 'IN_PROGRESS') {
      return res.status(400).json({ error: `Cannot finish ticket when status is ${ticket.status}` });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: { status: 'RESOLVED' },
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
    if (role !== 'WORKER' && role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only workers or admins can perform this action' });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      select: { id: true, assignedToId: true },
    });

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    if (role !== 'ADMIN' && ticket.assignedToId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to comment on this ticket' });
    }

    const workerIdForComment = role === 'ADMIN' ? ticket.assignedToId || req.user.id : req.user.id;
    if (!workerIdForComment) {
      return res.status(400).json({ error: 'Ticket has no assignee; assign a worker first' });
    }

    const comment = await prisma.comment.create({
      data: {
        text,
        ticketId: id,
        workerId: workerIdForComment,
      },
    });

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
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(users);
  } catch (error) {
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
    const resolvedIssues = await prisma.ticket.count({ where: { status: 'RESOLVED' } });
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