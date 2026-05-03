const prisma = require('../prismaClient');

//1. Authentication & Authorization APIs

//2. Issue Management APIs
//2.1 For Community Members (CM)
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

//1. Authentication & Authorization APIs
exports.registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const { data, error } = await prisma
            .from('users')
            .insert([{ name, email, password: hashedPassword, role }]);

        if (error) throw error;
        return res.status(201).json({ message: "Registration successful" });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const { data: user, error } = await prisma
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) return res.status(401).json({ error: "User not found" });

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return res.status(401).json({ error: "Invalid password" });

        // Generate JWT with Role-Based Access Control (RBAC) [cite: 33, 264]
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(200).json({ token, role: user.role });
    } catch (err) {
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.logoutUser = (req, res) => {
    // In a JWT setup, the client destroys the token locally[cite: 172].
    // We send a success response to confirm the action.
    return res.status(200).json({ message: "Logout successful" });
};

//2. Issue Management APIs
//2.1 For Community Members (CM)
exports.getMyIssues = async (req, res) => {
    try {
        const { data, error } = await prisma
            .from('tickets')
            .select('*')
            .eq('user_id', req.user.id); // req.user is populated by your JWT middleware; filter by logged-in user [cite: 35]

        if (error) throw error;
        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};


exports.getIssueStatus = async (req, res) => {
    const { id } = req.params;

    try {
        const { data: ticket, error } = await prisma
            .from('tickets')
            .select('id, description, location, status, category') // [cite: 126]
            .eq('id', id)
            .single();

        if (error || !ticket) return res.status(404).json({ error: "Ticket not found" });

        // Ensure a user can only view their own ticket status [cite: 264]
        if (ticket.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: "Access denied" });
        }

        // Returns current status: Issued, Assigned, InProgress, or Finished [cite: 198]
        return res.status(200).json(ticket);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};





//2.2 For Facility Managers (FM)


//2.3 For Workers (W)
// ==========================================================
// ANDREW'S PART: 2.3 For Workers (Core Flows)
// ==========================================================

// View only tickets assigned to the logged-in worker
exports.getAssignedIssues = async (req, res) => {
    try {
        const workerId = req.user && req.user.id;
        if (!workerId) return res.status(401).json({ error: 'Unauthorized' });

        const tickets = await prisma.ticket.findMany({
            where: { assignedToId: workerId },
            select: {
                id: true,
                title: true,
                description: true,
                category: true,
                status: true,
                createdAt: true,
                assignedTo: { select: { id: true, name: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return res.status(200).json(tickets);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Update status to "In Progress"
exports.startIssue = async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid ticket id' });

    try {
        const ticket = await prisma.ticket.findUnique({
            where: { id },
            select: { id: true, status: true, assignedToId: true }
        });

        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
        if (ticket.assignedToId !== req.user.id) return res.status(403).json({ error: 'Not authorized to start this ticket' });

        if (ticket.status === 'IN_PROGRESS') return res.status(400).json({ error: 'Ticket already started' });
        if (ticket.status === 'RESOLVED') return res.status(400).json({ error: 'Ticket already resolved' });
        if (ticket.status !== 'ASSIGNED') return res.status(400).json({ error: `Cannot start ticket when status is ${ticket.status}` });

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
                assignedTo: { select: { id: true, name: true, email: true } }
            }
        });

        return res.status(200).json(updatedTicket);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Update status to "Finished/Resolved"
exports.finishIssue = async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid ticket id' });

    try {
        const ticket = await prisma.ticket.findUnique({
            where: { id },
            select: { id: true, status: true, assignedToId: true }
        });

        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
        if (ticket.assignedToId !== req.user.id) return res.status(403).json({ error: 'Not authorized to finish this ticket' });

        if (ticket.status === 'RESOLVED') return res.status(400).json({ error: 'Ticket already resolved' });
        if (ticket.status !== 'IN_PROGRESS') return res.status(400).json({ error: `Cannot finish ticket when status is ${ticket.status}` });

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
                assignedTo: { select: { id: true, name: true, email: true } }
            }
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
        if (!req.user || !req.user.role || String(req.user.role).toUpperCase() !== 'WORKER') {
            return res.status(403).json({ error: 'Only workers can perform this action' });
        }

        const ticket = await prisma.ticket.findUnique({
            where: { id },
            select: { id: true, assignedToId: true }
        });

        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
        if (ticket.assignedToId !== req.user.id) return res.status(403).json({ error: 'Not authorized to comment on this ticket' });

        const comment = await prisma.comment.create({
            data: {
                text,
                ticketId: id,
                workerId: req.user.id
            }
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
        if (!req.user || !req.user.role || String(req.user.role).toUpperCase() !== 'WORKER') {
            return res.status(403).json({ error: 'Only workers can perform this action' });
        }

        const ticket = await prisma.ticket.findUnique({
            where: { id },
            select: { id: true, assignedToId: true }
        });

        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
        if (ticket.assignedToId !== req.user.id) return res.status(403).json({ error: 'Not authorized to upload photo for this ticket' });

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
                assignedTo: { select: { id: true, name: true, email: true } }
            }
        });

        return res.status(200).json(updatedTicket);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};


//3. Managerial & Admin APIs 
//3.1 Facility Manager (Worker Management)
// Get all workers from database
exports.getWorkers = async (req, res) => {
    try {
        const { data: workers, error } = await prisma
            .from('users')
            .select('*')
            .eq('role', 'worker');

        if (error) throw error;

        return res.status(200).json({
            message: "Workers fetched successfully",
            data: workers
        });
    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
};


// Update worker status in database
exports.updateWorkerStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({
            message: "Status is required"
        });
    }

    if (status !== "active" && status !== "inactive") {
        return res.status(400).json({
            message: "Status must be 'active' or 'inactive'"
        });
    }

    try {
        const { data, error } = await prisma
            .from('users')
            .update({ status })
            .eq('id', id)
            .select();

        if (error) throw error;

        return res.status(200).json({
            message: `Worker ${id} status updated to ${status}`,
            data: data
        });
    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
};
//3.2 System Admin (User Management)

// GET /api/admin/users
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

// PUT /api/admin/users/:id/status
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
