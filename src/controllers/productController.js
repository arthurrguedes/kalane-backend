import { supabase } from '../config/supabase.js';

export const getProdutos = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar produtos.', error: error.message });
  }
};

export const getProdutoById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Produto não encontrado.' });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar o produto.', error: error.message });
  }
};

export const atualizarEstoque = async (req, res) => {
  // Pega o ID do produto que vem na URL e a nova quantidade que vem no corpo da requisição
  const { id } = req.params;
  const { quantidade } = req.body;

  try {
    const { data, error } = await supabase
      .from('products')
      .update({ estoque: quantidade }) // Atualiza apenas a coluna estoque
      .eq('id', id); // Onde o ID for igual ao ID passado

    if (error) throw error;

    res.status(200).json({ message: 'Estoque atualizado com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar o estoque.', erro: error.message });
  }
};