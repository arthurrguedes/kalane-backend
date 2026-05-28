import express from 'express';
import { atualizarEstoque, getProdutos, getProdutoById } from '../controllers/productController.js';
import { requireAdmin } from '../middlewares/adminMiddleware.js';

const router = express.Router();

router.get('/', getProdutos);
router.get('/:id', getProdutoById);
router.patch('/:id/estoque', requireAdmin, atualizarEstoque);
router.patch('/:id/estoque', atualizarEstoque);

export default router;