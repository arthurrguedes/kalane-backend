import { supabase } from '../config/supabase.js';

// Buscar todos os favoritos do usuário logado
export const getFavorites = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('id, products(*)')
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Adicionar ou remover favorito (Toggle)
export const toggleFavorite = async (req, res) => {
  const { product_id } = req.body;
  
  try {
    // 1. Verifica se o produto já está nos favoritos deste usuário
    const { data: existingItem } = await supabase
      .from('favorites')
      .select('id')
      .match({ user_id: req.user.id, product_id })
      .maybeSingle(); // maybeSingle não dá erro se não encontrar nada

    if (existingItem) {
      // 2. Se já existe, significa que o usuário quer remover (desmarcar o coração)
      const { error } = await supabase
        .from('favorites')
        .delete()
        .match({ user_id: req.user.id, product_id });

      if (error) throw error;
      return res.status(200).json({ message: 'Removido dos favoritos', isFavorited: false });
    } else {
      // 3. Se não existe, adiciona aos favoritos
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: req.user.id, product_id });

      if (error) throw error;
      return res.status(200).json({ message: 'Adicionado aos favoritos', isFavorited: true });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};