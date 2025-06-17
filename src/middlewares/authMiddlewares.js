const jwt = require('jsonwebtoken')
const users = require('../models/users')

const secretKey = 'u924fnw9eufba9b5'

const middlewareDashboard = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader) {
        return next()
    }

    const token = authHeader.split(' ')[1]

    const decodedToken = jwt.verify(token, secretKey)

    const user = users.find(user => user.username === decodedToken.username)

    if (user) {
        req.authenticatedUser = user
    }

    next()

}

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader) {
        console.log('Token not provided')
        return res.status(401).json({ message: 'Token not provided' })
    }

    const token = authHeader.split(' ')[1]
    console.log('Received token:', token)

    try {
        const decodedToken = jwt.verify(token, secretKey)
        console.log('Decoded token:', decodedToken)

        // Buscar usuário pelo email do token
        const usersModel = require('../models/users')
        const user = await usersModel.getUserByEmail(decodedToken.email)
        console.log('User from DB:', user)

        if (!user) {
            console.log('User not found in DB')
            return res.status(401).json({ message: 'User not found' })
        }

        if (user.role !== 'admin') {
            console.log('Access denied: not admin')
            return res.status(401).json({ message: 'Access denied' })
        }

        req.authenticatedUser = user

        next()

    } catch (error) {
        console.log('Invalid token:', error.message)
        return res.status(401).json({ message: 'Invalid token' })
    }
}

module.exports = { authMiddleware, middlewareDashboard }