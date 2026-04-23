// Punto de entrada del backend de Banco Aerum
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
require('dotenv').config();

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Rutas de prueba
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Servidor activo', timestamp: new Date() });
});

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Importar rutas (se crearán a continuación)
const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/accounts');
const transactionRoutes = require('./routes/transactions');
const adminRoutes = require('./routes/admin');
const interbankRoutes = require('./routes/interbank');

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/interbank', interbankRoutes);

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal en el servidor' });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Servidor de Banca en Línea corriendo en el puerto ${PORT}`);
});

module.exports = app;
