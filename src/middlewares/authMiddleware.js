import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export const verificarAutenticacao = async (req, res, next) => {
  try {
    // Tenta pegar o token do cookie (que configurámos no login)
    const token = req.cookies.access_token;

    if (!token) {
      return res.status(401).json({ message: 'Acesso negado. Faça login.' });
    }

    // Verifica no Supabase se o token é válido
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: 'Token inválido ou expirado.' });
    }

    // Se for válido, guarda as informações do utilizador no "req" para usarmos nas próximas rotas
    req.user = user;
    next(); // Permite que a requisição continue
  } catch (error) {
    res.status(500).json({ message: 'Erro interno na verificação de segurança.' });
  }
};