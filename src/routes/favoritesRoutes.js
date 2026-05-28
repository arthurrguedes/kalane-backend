import express from 'express';
import { getFavorites, toggleFavorite } from '../controllers/favoritesController.js';
import { verificarAutenticacao } from '../middlewares/authMiddleware.js';

const router = express.Router();

// O usuário precisa estar logado para interagir com os favoritos
router.use(verificarAutenticacao);

router.get('/', getFavorites);
router.post('/toggle', toggleFavorite);

export default router;