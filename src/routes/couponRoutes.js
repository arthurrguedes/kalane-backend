import express from 'express';
import { validarCupom } from '../controllers/couponController.js';

const router = express.Router();

// Visitantes e usuários logados podem validar cupons, então não há trava de segurança
router.post('/validar', validarCupom);

export default router;