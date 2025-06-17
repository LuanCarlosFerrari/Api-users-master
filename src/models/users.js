const pool = require('../config/db');

// Retorna todos os usuários (sem senha)
async function getAllUsers() {
    const result = await pool.query('SELECT id, username, email, role FROM public.users ORDER BY id');
    return result.rows;
}

// Busca usuário por email (inclui senha, para login)
async function getUserByEmail(email) {
    const result = await pool.query('SELECT * FROM public.users WHERE email = $1', [email]);
    return result.rows[0];
}

// Busca usuário por id
async function getUserById(id) {
    const result = await pool.query('SELECT id, username, email, role FROM public.users WHERE id = $1', [id]);
    return result.rows[0];
}

// Cria novo usuário
async function createUser({ username, email, password, role }) {
    const result = await pool.query(
        'INSERT INTO public.users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
        [username, email, password, role]
    );
    return result.rows[0];
}

// Atualiza usuário existente
async function updateUser(id, { username, email, role }) {
    const result = await pool.query(
        'UPDATE public.users SET username = $1, email = $2, role = $3 WHERE id = $4 RETURNING id, username, email, role',
        [username, email, role, id]
    );
    return result.rows[0];
}

// Remove usuário
async function deleteUser(id) {
    await pool.query('DELETE FROM public.users WHERE id = $1', [id]);
}

module.exports = {
    getAllUsers,
    getUserByEmail,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};