import { supabase } from '../config/supabase.js';

export const requireAdmin = async (req, res, next) => {
  try {
    // 1. Pega o token do usuário que está tentando acessar
    const token = req.cookies.access_token;
    if (!token) return res.status(401).json({ message: 'Acesso negado. Faça login.' });

    // 2. Descobre quem é o usuário
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ message: 'Token inválido.' });

    // 3. Verifica se ele é admin no banco de dados
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile || profile.is_admin !== true) {
      return res.status(403).json({ message: 'Acesso restrito apenas para administradores.' });
    }

    // Se chegou aqui, ele é admin! Pode continuar a requisição.
    next();
  } catch (error) {
    res.status(500).json({ message: 'Erro de validação de servidor.' });
  }
};