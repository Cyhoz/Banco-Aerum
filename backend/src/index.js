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
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Rutas de prueba
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Servidor activo', timestamp: new Date() });
});


// Importar rutas (se crearán a continuación)
const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/accounts');
const transactionRoutes = require('./routes/transactions');
const adminRoutes = require('./routes/admin');
const interbankRoutes = require('./routes/interbank');

// Usar rutas con prefijo /api
const apiPrefix = '/api';

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/accounts`, accountRoutes);
app.use(`${apiPrefix}/transactions`, transactionRoutes);
app.use(`${apiPrefix}/admin`, adminRoutes);
app.use(`${apiPrefix}/interbank`, interbankRoutes);

const swaggerOptions = {
  customCssUrl: "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css",
  customJs: [
    "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js",
    "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js"
  ]
};

app.use(`${apiPrefix}/api-docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpecs, swaggerOptions));

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal en el servidor' });
});

// Solo iniciar el servidor si este archivo se ejecuta directamente
if (require.main === module) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Servidor de Banca en Línea corriendo en el puerto ${PORT}`);
  });
}

module.exports = app;
