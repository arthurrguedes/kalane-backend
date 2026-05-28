import { supabase } from '../config/supabase.js';

export const getCart = async (req, res) => {
  try {
    // Busca os itens do carrinho e já traz os dados do produto relacionado
    const { data, error } = await supabase
      .from('cart_items')
      .select('id, quantity, products(*)')
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addToCart = async (req, res) => {
  const { product_id, quantity } = req.body;
  try {
    // Upsert: Se já existir o par (user_id, product_id), ele atualiza a quantidade. Se não, insere.
    const { error } = await supabase
      .from('cart_items')
      .upsert(
        { user_id: req.user.id, product_id, quantity },
        { onConflict: 'user_id,product_id' }
      );

    if (error) throw error;
    res.status(200).json({ message: 'Carrinho atualizado.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  const { product_id } = req.params;
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .match({ user_id: req.user.id, product_id });

    if (error) throw error;
    res.status(200).json({ message: 'Item removido.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};