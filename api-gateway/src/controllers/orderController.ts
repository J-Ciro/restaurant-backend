import { Request, Response } from 'express';
import axios from 'axios';

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3001';

/**
 * POST /orders - Crear un nuevo pedido
 */
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { customerName, items } = req.body;

    // Validaciones básicas
    if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'customerName e items son requeridos'
      });
    }

    // Hacer fetch al order-service
    const response = await axios.post(`${ORDER_SERVICE_URL}/orders`, {
      customerName,
      items
    });

    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('Error en createOrder:', error);
    
    if (error.response) {
      // El servicio respondió con un error
      return res.status(error.response.status).json({
        error: error.response.data?.error || 'Error al crear el pedido',
        details: error.response.data?.details
      });
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      return res.status(503).json({
        error: 'Order Service no disponible',
        message: 'No se pudo conectar con el servicio de pedidos'
      });
    } else {
      // Error al configurar la petición
      return res.status(500).json({
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  }
};

/**
 * GET /orders/:id - Obtener un pedido por ID
 */
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: 'ID del pedido es requerido'
      });
    }

    // Hacer fetch al order-service
    const response = await axios.get(`${ORDER_SERVICE_URL}/orders/${id}`);

    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('Error en getOrderById:', error);
    
    if (error.response) {
      return res.status(error.response.status).json({
        error: error.response.data?.error || 'Error al obtener el pedido',
        details: error.response.data?.details
      });
    } else if (error.request) {
      return res.status(503).json({
        error: 'Order Service no disponible',
        message: 'No se pudo conectar con el servicio de pedidos'
      });
    } else {
      return res.status(500).json({
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  }
};

/**
 * GET /orders/:id/status - Consultar estado de un pedido
 */
export const getOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: 'ID del pedido es requerido'
      });
    }

    // Hacer fetch al order-service
    const response = await axios.get(`${ORDER_SERVICE_URL}/orders/${id}/status`);

    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('Error en getOrderStatus:', error);
    
    if (error.response) {
      return res.status(error.response.status).json({
        error: error.response.data?.error || 'Error al consultar el estado',
        details: error.response.data?.details
      });
    } else if (error.request) {
      return res.status(503).json({
        error: 'Order Service no disponible',
        message: 'No se pudo conectar con el servicio de pedidos'
      });
    } else {
      return res.status(500).json({
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  }
};

/**
 * GET /orders - Obtener todos los pedidos
 */
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { limit, skip } = req.query;

    // Construir query string
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit as string);
    if (skip) queryParams.append('skip', skip as string);

    const url = `${ORDER_SERVICE_URL}/orders${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    // Hacer fetch al order-service
    const response = await axios.get(url);

    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('Error en getAllOrders:', error);
    
    if (error.response) {
      return res.status(error.response.status).json({
        error: error.response.data?.error || 'Error al obtener los pedidos',
        details: error.response.data?.details
      });
    } else if (error.request) {
      return res.status(503).json({
        error: 'Order Service no disponible',
        message: 'No se pudo conectar con el servicio de pedidos'
      });
    } else {
      return res.status(500).json({
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  }
};
