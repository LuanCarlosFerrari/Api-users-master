const express = require('express')
const jwt = require('jsonwebtoken');
const { middlewareDashboard, authMiddleware } = require('../middlewares/authMiddlewares')
const usersModel = require('../models/users')

const authRouter = express.Router()
const secretKey = 'u924fnw9eufba9b5'; // Certifique-se de centralizar isso em produção

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticates a user
 *     description: Logs in a user and returns a JWT token along with user details including role.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 */
authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    try {
        const user = await usersModel.getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // IMPORTANTE: Em produção, use hash de senha!
        if (user.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ username: user.username, email: user.email, role: user.role }, secretKey, { expiresIn: '1h' });
        res.status(200).json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        if (error && error.stack) {
            console.error(error.stack);
        }
        res.status(500).json({ message: 'Erro no login', error: error.message });
    }
});

/**
 * @swagger
 * /auth/dashboard:
 *   get:
 *     summary: Acessa o dashboard
 *     description: Retorna uma mensagem de boas-vindas personalizada baseada na autenticação
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mensagem de boas-vindas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
authRouter.get('/dashboard', middlewareDashboard, (req, res) => {

    if (!req.authenticatedUser) {
        return res.status(200).json({ message: 'Welcome to the dashboard Visitor' })
    }

    res.status(200).json({ message: `Welcome to the dashboard ${req.authenticatedUser.username}!` })

})

authRouter.get('/dashboard/admin', authMiddleware, (req, res) => {
    res.status(200).json({ message: `Welcome to the admin dashboard ${req.authenticatedUser.username}!` })
})


// ADMIN SHOW USER BY EMAIL
authRouter.get('/dashboard/admin/show', authMiddleware, async (req, res) => {
    const { email } = req.body;
    try {
        const user = await usersModel.getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: `User ${user.username} found!`, user });
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ message: 'Erro ao buscar usuário' });
    }
});

// ADMIN UPDATE USER
authRouter.post('/dashboard/admin/update', authMiddleware, async (req, res) => {
    const { email, newName, newEmail, newRole } = req.body;
    try {
        const user = await usersModel.getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Verifica se o novo email já existe em outro usuário
        if (newEmail) {
            const existing = await usersModel.getUserByEmail(newEmail);
            if (existing && existing.id !== user.id) {
                return res.status(409).json({ message: 'Email already registered by another user' });
            }
        }
        const updatedUser = await usersModel.updateUser(user.id, {
            username: newName || user.username,
            email: newEmail || user.email,
            role: newRole || user.role
        });
        res.status(201).json({ message: `User ${updatedUser.username} updated!`, user: updatedUser });
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ message: 'Erro ao atualizar usuário' });
    }
});

// ADMIN DELETE USER BY EMAIL
authRouter.delete('/dashboard/admin/:email', authMiddleware, async (req, res) => {
    const { email } = req.params;
    try {
        const user = await usersModel.getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: 'User not Found!' });
        }
        await usersModel.deleteUser(user.id);
        res.status(204).end();
    } catch (error) {
        console.error('Erro ao remover usuário:', error);
        res.status(500).json({ message: 'Erro ao remover usuário' });
    }
});

module.exports = authRouter