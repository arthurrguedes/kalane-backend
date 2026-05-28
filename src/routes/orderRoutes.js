import express from 'express';
import { checkout, getUserOrders } from '../controllers/orderController.js';
import { verificarAutenticacao } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Todas as rotas de pedido requerem que o utilizador esteja logado
router.use(verificarAutenticacao);

router.post('/checkout', checkout);
router.get('/', getUserOrders);

export default router;