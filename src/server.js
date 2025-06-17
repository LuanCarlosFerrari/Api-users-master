const express = require('express')
const path = require('path')
const cors = require('cors') // Adicionar esta linha
const mainRouter = require('./routes/mainRoutes')
const authRouter = require('./routes/authRoutes')
const userRouter = require('./routes/userRoutes') // Adicionar esta linha
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./swagger')

const app = express()

// Habilitar CORS para todas as origens
app.use(cors()) // Adicionar esta linha

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, '../public'))) // Adicionar esta linha

app.use(express.json())

// Configuração do Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use('/test', mainRouter)
app.use('/auth', authRouter)
app.use('/api', userRouter) // Adicionar esta linha

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Servidor iniciado em http://localhost:${PORT}/`)
    console.log(`Documentação Swagger disponível em http://localhost:${PORT}/api-docs`)
})



