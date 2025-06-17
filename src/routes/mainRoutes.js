const express = require('express')
const jwt = require('jsonwebtoken')
const users = require('../models/users')

const mainRouter = express.Router()

const secretKey = 'u924fnw9eufba9b5'

mainRouter.post('/login', (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ message: 'All parameters are required' })
    }

    const user = users.find(user => user.email === email)

    if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid Credencials' })
    }

    const username = user.username

    const payload = { username }

    const token = jwt.sign(payload, secretKey, { expiresIn: '1h' })

    res.json({ message: 'Login successful', token })
})


module.exports = mainRouter