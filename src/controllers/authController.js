import { supabase } from '../config/supabase.js';

export const register = async (req, res) => {
  const { email, password, nome, aceitaMarketing } = req.body;

  try {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true 
    });
    if (authError) throw authError;

    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{ 
        id: authData.user.id, 
        nome: nome,
        aceita_marketing: aceitaMarketing 
      }]);
    if (profileError) throw profileError;

    res.status(201).json({ message: 'Conta criada com sucesso!' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    res.cookie('access_token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    res.status(200).json({ id: data.user.id, email: data.user.email });
  } catch (error) {
    res.status(401).json({ message: 'Credenciais inválidas.' });
  }
};

export const logout = (req, res) => {
  res.clearCookie('access_token');
  res.status(200).json({ message: 'Sessão encerrada com sucesso.' });
};

export const getMe = async (req, res) => {
  try {
    const token = req.cookies.access_token;
    if (!token) {
      return res.status(401).json({ message: 'Não autenticado' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    res.status(200).json({ id: user.id, email: user.email });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao verificar sessão' });
  }
};