const express = require('express');
const router = express.Router();
const db = require('../db/database');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await db.users.authenticate(email, password);

        if (user) {
            res.json({ success: true, user });
        } else {
            res.status(401).json({ error: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// GET /api/auth/profile/:id
router.get('/profile/:id', async (req, res) => {
    try {
        const user = await db.users.getById(req.params.id);
        if (user) {
            const userObj = user.toObject ? user.toObject() : user;
            const { password, ...safeUser } = userObj;
            res.json(safeUser);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// PUT /api/auth/profile/:id
router.put('/profile/:id', async (req, res) => {
    try {
        const { name, email, currentPassword, newPassword } = req.body;
        const userId = req.params.id;

        // Get existing user
        const existingUser = await db.users.getById(userId);
        if (!existingUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // If changing password, verify current password
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ error: 'Current password is required to set new password' });
            }
            if (existingUser.password !== currentPassword) {
                return res.status(401).json({ error: 'Current password is incorrect' });
            }
        }

        // Build update data
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (newPassword) updateData.password = newPassword;

        const updatedUser = await db.users.update(userId, updateData);

        if (updatedUser) {
            res.json({ success: true, user: updatedUser });
        } else {
            res.status(500).json({ error: 'Failed to update profile' });
        }
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

module.exports = router;
