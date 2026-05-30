import { createClient } from '@supabase/supabase-js';

const createLocalClient = () => {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
};

export const register = async (req, res) => {
  const { email, password, nome, aceitaMarketing } = req.body;
  const supabase = createLocalClient();

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
  const supabase = createLocalClient();

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const { data: profile } = await supabase
      .from('profiles')
      .select('nome, is_admin')
      .eq('id', data.user.id)
      .single();

    res.cookie('access_token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    res.status(200).json({ id: data.user.id, nome: profile?.nome || '', email: data.user.email, isAdmin: profile?.is_admin || false });
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

    const supabase = createLocalClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('nome, is_admin')
      .eq('id', user.id)
      .single();

    res.status(200).json({ id: user.id, nome: profile?.nome || '', email: user.email, isAdmin: profile?.is_admin || false });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao verificar sessão' });
  }
};