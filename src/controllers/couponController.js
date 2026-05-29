import { supabase } from '../config/supabase.js';

export const validarCupom = async (req, res) => {
  const { codigo, emailCliente } = req.body;

  if (!codigo || !emailCliente) {
    return res.status(400).json({ message: 'Código do cupom e E-mail são obrigatórios.' });
  }

  try {
    // 1. Busca o cupom no banco (ignora maiúsculas/minúsculas com o ilike)
    const { data: cupom, error } = await supabase
      .from('coupons')
      .select('*')
      .ilike('codigo', codigo.trim())
      .single();

    if (error || !cupom || !cupom.ativo) {
      return res.status(404).json({ message: 'Cupom inválido ou expirado.' });
    }

    // 2. Verifica se o cupom tem limite e se já esgotou
    if (cupom.max_usos !== null && cupom.usos_atuais >= cupom.max_usos) {
      return res.status(400).json({ message: 'Este cupom já atingiu o limite máximo de usos.' });
    }

    // 3. Verifica se ESTE E-MAIL já usou este cupom (Impede de usar 2x)
    const { data: usoAnterior } = await supabase
      .from('coupon_usages')
      .select('id')
      .eq('cupom_id', cupom.id)
      .ilike('email_cliente', emailCliente.trim())
      .single();

    if (usoAnterior) {
      return res.status(400).json({ message: 'Você já utilizou este cupom em outra compra.' });
    }

    // 4. Tudo certo! Libera o desconto
    res.status(200).json({ 
      id: cupom.id, 
      percentual: cupom.percentual_desconto,
      codigo: cupom.codigo
    });

  } catch (error) {
    res.status(500).json({ message: 'Erro interno ao validar o cupom.', error: error.message });
  }
};