const express = require('express')
const jwt = require('jsonwebtoken'); // Added
const { middlewareDashboard, authMiddleware } = require('../middlewares/authMiddlewares')
const users = require('../models/users')

const authRouter = express.Router()
const secretKey = 'u924fnw9eufba9b5'; // Added (ensure this is consistent with authMiddlewares.js or centralized)

function findUser(email) {
    return users.find(user => user.email === email)
}

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
authRouter.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = users.find(u => u.email === email);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // IMPORTANT: In a real application, passwords should be hashed and compared securely.
    // For this example, we are doing a plain text comparison.
    if (user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Include role in the JWT payload
    const token = jwt.sign({ username: user.username, role: user.role }, secretKey, { expiresIn: '1h' });

    // Return token and user info (including role)
    res.status(200).json({
        token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        }
    });
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

authRouter.get('/dashboard/admin/show', authMiddleware, (req, res) => {
    const { username, email } = req.body

    const user = findUser(email)

    if (!user) {
        return res.status(404).json({ message: 'User not found' })
    }

    res.status(200).json({ message: `User ${username} found!`, user })
})

authRouter.post('/dashboard/admin/update', authMiddleware, (req, res) => {
    const { email, newName, newEmail, newRole } = req.body

    const user = findUser(email)

    if (!user) {
        return res.status(404).json({ message: 'User not found' })
    }

    if (newName) {
        user.username = newName
    }

    if (newEmail) {
        user.email = newEmail
    }

    if (newRole) {
        user.role = newRole
    }

    res.status(201).json({ message: `User ${user.username} updated!`, user })

})

authRouter.delete('/dashboard/admin/:email', authMiddleware, (req, res) => {
    const { email } = req.params

    const userIndex = users.findIndex(user => user.email === email)

    if (userIndex === -1) {
        res.status(404).json({ message: "User not Found!" })
    }

    users.splice(userIndex, 1)

    res.status(204).end()
})

module.exports = authRouter