const express = require('express');
const usersModel = require('../models/users'); // Agora importando o módulo de funções
const jwt = require('jsonwebtoken');
const { authMiddleware } = require('../middlewares/authMiddlewares');

const router = express.Router();

// GET /api/users - Listar todos os usuários
router.get('/users', authMiddleware, async (req, res) => {
    try {
        const users = await usersModel.getAllUsers();
        console.log('API /api/users retornou:', users);
        res.status(200).json(users);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ message: 'Erro ao buscar usuários' });
    }
});

// POST /api/users - Registrar um novo usuário (apenas admin)
router.post('/users', authMiddleware, async (req, res) => {
    const { username, password, email, role } = req.body;
    if (!username || !password || !email) {
        return res.status(400).json({ message: 'All parameters are required: username, email, password' });
    }
    const allowedRoles = ['standard', 'admin'];
    const selectedRole = role && allowedRoles.includes(role) ? role : 'standard';
    if (/(?<=.{2})@(?=.{2,}\..{2})/.test(email) === false) {
        return res.status(400).json({ message: 'E-mail invalid' });
    }
    try {
        const existing = await usersModel.getUserByEmail(email);
        if (existing) {
            return res.status(409).json({ message: 'Email already registered in the database' });
        }
        const newUser = await usersModel.createUser({ username, password, email, role: selectedRole });
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ message: 'Erro ao criar usuário' });
    }
});

// PUT /api/users/:id - Atualizar um usuário existente
router.put('/users/:id', authMiddleware, async (req, res) => {
    const userId = parseInt(req.params.id);
    const { username, email, role } = req.body;
    if (!username || !email || !role) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    if (/(?<=.{2})@(?=.{2,}\..{2})/.test(email) === false) {
        return res.status(400).json({ message: 'Invalid e-mail format' });
    }
    const allowedRoles = ['standard', 'admin'];
    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: 'Invalid role. Allowed roles are: standard, admin' });
    }
    try {
        // Verificar se o novo email já existe em outro usuário
        const existing = await usersModel.getUserByEmail(email);
        if (existing && existing.id !== userId) {
            return res.status(409).json({ message: 'Email already registered by another user' });
        }
        const updatedUser = await usersModel.updateUser(userId, { username, email, role });
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ message: 'Erro ao atualizar usuário' });
    }
});

// DELETE /api/users/:id - Remover um usuário
router.delete('/users/:id', authMiddleware, async (req, res) => {
    const userId = parseInt(req.params.id);
    try {
        const user = await usersModel.getUserById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await usersModel.deleteUser(userId);
        res.status(204).send();
    } catch (error) {
        console.error('Erro ao remover usuário:', error);
        res.status(500).json({ message: 'Erro ao remover usuário' });
    }
});

module.exports = router;
