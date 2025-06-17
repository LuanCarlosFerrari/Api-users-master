# 👥 API de Gerenciamento de Usuários

API RESTful em JavaScript com Node.js para gerenciamento de usuários. Implementa autenticação via JWT, controle de acesso por níveis de permissão (standard/admin) e funcionalidades para registrar, autenticar, consultar, atualizar e deletar usuários.

---

## 🚀 Tecnologias Utilizadas

- **JavaScript**
- **Node.js**
- **Express** – Gerenciamento de rotas
- **JWT (JSON Web Token)** – Autenticação e autorização

---

## 📁 Estrutura do Projeto

```
/src
  /middlewares
  /models
  /routes
  server.js
```

---

## 📌 Pré-requisitos

- Node.js instalado (v18+)
- npm ou yarn

---

## ⚙️ Instalação

```bash
git clone https://github.com/samuelgomesp/Api-users
npm install express jsonwebtoken
```

---

## ▶️ Como rodar o projeto

```bash
npm run server
```

> O servidor será iniciado em `http://localhost:3000`

---

## ⭐ Funcionamento

Caso tenha interesse há um vídeo que gravei explicando um pouco mais sobre o projeto, como uma maneira mais didática de compreendê-lo, o conteúdo encontra-se na rede linkedin.

Acesse [vídeo Api](https://www.linkedin.com/feed/update/urn:li:activity:7319114110145593344/)

---

## 🔐 Autenticação & Permissões

- Todos os usuários são criados com o nível **"standard"** por padrão.
- Algumas rotas exigem nível de permissão **"admin"**.
- Para acessar rotas protegidas, envie o token JWT no header > auth > bearer em ambientes de teste como postman e thudercliente ou:

```
Authorization: Bearer <seu-token>
```

---

## 📮 Endpoints

### 📝 Registro & Login

#### `POST /test/register`
Registra um novo usuário (nível padrão: "standard").

**Body:**
```json
{
  "email": "exemplo@email.com",
  "username": "usuario123",
  "password": "senhaSegura"
}
```

#### `POST /test/login`
Autentica um usuário e retorna o token JWT.

**Body:**
```json
{
  "email": "exemplo@email.com",
  "password": "senhaSegura"
}
```

**Resposta:**
```json
{
  "token": "seu.jwt.token.aqui"
}
```

---

### 🔓 Acesso Geral

#### `GET /auth/dashboard`
- Se autenticado, retorna uma mensagem personalizada.
- Caso contrário, será tratado como visitante.

**Requer:** Header com Bearer token

---

### 🛡️ Acesso Admin

#### `GET /auth/dashboard/admin`
Acesso exclusivo para usuários com role **admin**.

**Requer:** Header com Bearer token

---

#### `GET /auth/dashboard/admin/show`
Retorna os dados de um usuário específico.

**Body:**
```json
{
  "username": "usuario123",
  "email": "exemplo@email.com"
}
```

**Requer:** Header com Bearer token (admin)

---

#### `POST /auth/dashboard/admin/update`
Atualiza os dados de um usuário.

**Body (exemplos):**
```json
{
  "email": "usuario@atual.com",
  "newUser": "novoNome"
}
```
```json
{
  "email": "usuario@atual.com",
  "newEmail": "novo@email.com",
  "newRole": "admin"
}
```

**Requer:** Header com Bearer token (admin)

---

#### `DELETE /auth/dashboard/admin/:email`
Deleta um usuário com base no e-mail (passado como parâmetro na URL).

**Exemplo de rota:**
```
DELETE /auth/dashboard/admin/usuario@email.com
```

**Requer:** Header com Bearer token (admin)

---

## 🛠️ Ambiente de Desenvolvimento Recomendado

Este projeto foi desenvolvido utilizando o **Visual Studio Code**. Para uma melhor experiência, recomenda-se:

Visite: [Dowload VSCode](https://code.visualstudio.com/download)


---


> Desenvolvido por [Samuel Gomes](https://github.com/samuelgomesp)
