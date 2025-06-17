const express = require('express');
const users = require('../models/users'); // Nosso array de usuários em memória
const jwt = require('jsonwebtoken'); // Se precisarmos para futuras extensões

const router = express.Router();

// GET /api/users - Listar todos os usuários
router.get('/users', (req, res) => {
    // Por enquanto, não há necessidade de IDs específicos no modelo de usuário,
    // mas se houvesse, seria bom retorná-los.
    // O frontend espera 'id', 'username', 'email'.
    // Vamos mapear os usuários para incluir um 'id' simples (índice do array + 1)
    const usersWithId = users.map((user, index) => ({
        id: index + 1, // Simples ID baseado no índice
        username: user.username,
        email: user.email
        // Não vamos expor a senha ou role aqui por padrão
    }));
    res.status(200).json(usersWithId);
});

// POST /api/users - Registrar um novo usuário (adaptado de mainRoutes.js)
router.post('/users', (req, res) => {
    const { username, password, email } = req.body;

    const emailExists = users.find(user => user.email === email);

    if (emailExists) {
        return res.status(409).json({ message: 'Email already registered in the database' });
    }

    if (!username || !password || !email) {
        return res.status(400).json({ message: 'All parameters are required: username, email, password' });
    }

    // Regex simples para validação de email (a mesma de mainRoutes)
    if (/(?<=.{2})@(?=.{2,}\..{2})/.test(email) === false) {
        return res.status(400).json({ message: "E-mail invalid" });
    }

    // Adicionando um ID simples ao novo usuário.
    // Em um sistema real, o ID seria gerado pelo banco de dados.
    const newUser = {
        id: users.length + 1, // ID simples
        username,
        password, // Em um sistema real, a senha seria hasheada
        email,
        role: 'standard' // Papel padrão
    };
    users.push(newUser);

    // Retornar o novo usuário criado (sem a senha)
    const userResponse = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
    };

    res.status(201).json(userResponse); // Frontend espera o novo usuário como resposta
});

module.exports = router;
