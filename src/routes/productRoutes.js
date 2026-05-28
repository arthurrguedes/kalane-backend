import express from 'express';
import { getProdutos, getProdutoById } from '../controllers/productController.js';

const router = express.Router();

router.get('/', getProdutos);
router.get('/:id', getProdutoById);

export default router;