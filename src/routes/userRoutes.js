const express = require('express');
const users = require('../models/users'); // Nosso array de usuários em memória
const jwt = require('jsonwebtoken'); // Se precisarmos para futuras extensões
const { authMiddleware } = require('../middlewares/authMiddlewares'); // Import authMiddleware

const router = express.Router();

// GET /api/users - Listar todos os usuários
router.get('/users', (req, res) => {
    const usersWithIdAndRole = users.map((user, index) => ({
        id: user.id || index + 1, // Use existing user.id if available, otherwise generate based on index
        username: user.username,
        email: user.email,
        role: user.role // Include role in the response
    }));
    res.status(200).json(usersWithIdAndRole);
});

// POST /api/users - Registrar um novo usuário
// Protegendo a rota de criação de usuário para que apenas administradores possam criar novos usuários.
router.post('/users', authMiddleware, (req, res) => { // Added authMiddleware here
    const { username, password, email, role } = req.body; // Added role

    const emailExists = users.find(user => user.email === email);

    if (emailExists) {
        return res.status(409).json({ message: 'Email already registered in the database' });
    }

    if (!username || !password || !email) {
        return res.status(400).json({ message: 'All parameters are required: username, email, password' });
    }

    const allowedRoles = ['standard', 'admin'];
    const selectedRole = role && allowedRoles.includes(role) ? role : 'standard'; // Validate role, default to standard

    // Regex simples para validação de email (a mesma de mainRoutes)
    if (/(?<=.{2})@(?=.{2,}\..{2})/.test(email) === false) {
        return res.status(400).json({ message: "E-mail invalid" });
    }

    // Adicionando um ID simples ao novo usuário.
    // Em um sistema real, o ID seria gerado pelo banco de dados.
    const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1, // Ensure unique ID
        username,
        password,
        email,
        role: selectedRole // Use the validated or default role
    };
    users.push(newUser);

    // Retornar o novo usuário criado (sem a senha)
    const userResponse = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
    };

    res.status(201).json(userResponse);
}); // Certifique-se de que este fechamento de rota está correto

module.exports = router;
