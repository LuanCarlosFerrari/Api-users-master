const express = require('express')
const { middlewareDashboard, authMiddleware } = require('../middlewares/authMiddlewares')
const users = require('../models/users')

const authRouter = express.Router()

function findUser(email) {
    return users.find(user => user.email === email)
}

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