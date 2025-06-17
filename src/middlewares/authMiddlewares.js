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

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader) {
        return res.status(401).json({ message: 'Token not provided' })
    }

    const token = authHeader.split(' ')[1]

    try {
        const decodedToken = jwt.verify(token, secretKey)

        const user = users.find(user => user.username === decodedToken.username)

        if (user.role !== 'admin') {
            return res.status(401).json({ message: 'Access denied' })
        }

        req.authenticatedUser = user

        next()

    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' })
    }
}

module.exports = { authMiddleware, middlewareDashboard }