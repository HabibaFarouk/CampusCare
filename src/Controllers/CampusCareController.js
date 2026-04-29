const prisma = require('../prismaClient');
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
    return res.status(200).json({ message: "Logout successful" });
};

//2. Issue Management APIs
//2.1 For Community Members (CM)
exports.getMyIssues = async (req, res) => {
    try {
        const { data, error } = await prisma
            .from('tickets')
            .select('*')
            .eq('user_id', req.user.id);

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
            .select('id, description, location, status, category')
            .eq('id', id)
            .single();

        if (error || !ticket) return res.status(404).json({ error: "Ticket not found" });

        if (ticket.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: "Access denied" });
        }

        return res.status(200).json(ticket);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// -------------- Rana's Task: Admin User Management APIs --------------
// 3.2 System Admin (User Management)
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
//-------------- End of Rana's Task --------------