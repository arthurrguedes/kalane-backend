import express from 'express';
import { getCart, addToCart, removeFromCart } from '../controllers/cartController.js';
import { verificarAutenticacao } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Aplica a verificação de segurança em TODAS as rotas de carrinho
router.use(verificarAutenticacao); 

router.get('/', getCart);
router.post('/', addToCart);
router.delete('/:product_id', removeFromCart);

export default router;