import express from 'express';
import { obterPerfil, atualizarPerfil } from '../controllers/profileController.js';
import { verificarAutenticacao } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

// Agora usamos o nome correto da sua função de segurança
router.get('/', verificarAutenticacao, obterPerfil);
router.put('/', verificarAutenticacao, atualizarPerfil);

export default router;