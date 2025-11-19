import express from 'express';
import cors from 'cors';
import { connectDatabase } from './config/database';
import { rabbitMQClient } from './rabbitmq/rabbitmqClient';
import orderRoutes from './routes/orderRoutes';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/orders', orderRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'order-service',
    timestamp: new Date().toISOString()
  });
});

// Inicializar servicios
async function startServer() {
  try {
    // Conectar a MongoDB
    await connectDatabase();

    // Conectar a RabbitMQ
    await rabbitMQClient.connect();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`📋 Order Service corriendo en puerto ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
      console.log(`📦 Endpoints disponibles:`);
      console.log(`   POST   /orders - Crear pedido`);
      console.log(`   GET    /orders - Listar pedidos`);
      console.log(`   GET    /orders/:id - Obtener pedido`);
      console.log(`   GET    /orders/:id/status - Consultar estado`);
    });
  } catch (error) {
    console.error('❌ Error iniciando el servidor:', error);
    process.exit(1);
  }
}

// Manejar cierre graceful
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM recibido, cerrando servidor...');
  await rabbitMQClient.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT recibido, cerrando servidor...');
  await rabbitMQClient.close();
  process.exit(0);
});

// Iniciar el servidor
startServer();

