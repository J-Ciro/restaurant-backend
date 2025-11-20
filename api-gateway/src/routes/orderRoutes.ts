import { Router } from 'express';
import { createOrder, getOrderById, getOrderStatus, getAllOrders } from '../controllers/orderController';

const router = Router();

// GET /orders - Obtener todos los pedidos (debe ir antes de /:id)
router.get('/', getAllOrders);

// GET /orders/:id/status - Consultar estado de pedido (debe ir antes de /:id)
router.get('/:id/status', getOrderStatus);

// POST /orders - Crear pedido
router.post('/', createOrder);

// GET /orders/:id - Obtener pedido por ID
router.get('/:id', getOrderById);

export default router;

