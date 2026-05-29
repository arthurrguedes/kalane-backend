import { supabase } from '../config/supabase.js';

export const obterPerfil = async (req, res) => {
  const userId = req.user.id; // O ID vem do middleware de autenticação

  try {
    const { data: perfil, error } = await supabase
      .from('profiles')
      .select('id, nome, telefone, avatar_url, cep, endereco, aceita_marketing, id_admin')
      .eq('id', userId)
      .single();

    if (error || !perfil) {
      return res.status(404).json({ message: 'Perfil não encontrado.' });
    }

    // Retorna os dados da tabela juntamente com o e-mail do objeto de autenticação
    res.status(200).json({
      ...perfil,
      email: req.user.email
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar dados do perfil.', error: error.message });
  }
};

// Atualiza os dados cadastrais, e-mail e senha
export const atualizarPerfil = async (req, res) => {
  const userId = req.user.id;
  const { nome, telefone, cep, endereco, aceita_marketing, email, senha } = req.body;

  try {
    // 1. Se houver e-mail ou senha novos, atualiza diretamente no módulo de Auth do Supabase
    if (email || senha) {
      const dadosAtualizacaoAuth = {};
      if (email) dadosAtualizacaoAuth.email = email;
      if (senha) dadosAtualizacaoAuth.password = senha;

      // Atualiza o usuário utilizando o cliente admin ou o token do próprio contexto dependendo da configuração
      const { error: errorAuth } = await supabase.auth.admin.updateUserById(userId, dadosAtualizacaoAuth);
      
      if (errorAuth) {
        return res.status(400).json({ message: 'Erro ao atualizar dados de acesso (e-mail/senha).', error: errorAuth.message });
      }
    }

    // 2. Atualiza os dados comerciais na tabela pública 'profiles'
    const { data: perfilAtualizado, error: errorPerfil } = await supabase
      .from('profiles')
      .update({
        nome,
        telefone,
        cep,
        endereco,
        aceita_marketing
      })
      .eq('id', userId)
      .select()
      .single();

    if (errorPerfil) {
      return res.status(400).json({ message: 'Erro ao atualizar dados cadastrais.', error: errorPerfil.message });
    }

    res.status(200).json({
      message: 'Perfil atualizado com sucesso!',
      perfil: perfilAtualizado
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno ao atualizar o perfil.', error: error.message });
  }
};