import { supabase } from '../config/supabase.js';

export const checkout = async (req, res) => {
  const { delivery_address, payment_method } = req.body;
  const user_id = req.user.id;
  const taxaEntrega = 15.00; // Deve ser igual à do frontend

  try {
    // 1. Busca os itens do carrinho e os preços reais direto do banco de dados
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select('quantity, products(id, price)')
      .eq('user_id', user_id);

    if (cartError) throw cartError;
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'O carrinho está vazio.' });
    }

    // 2. Calcula o subtotal de forma segura (ignora valores enviados pelo frontend)
    let subtotal = 0;
    for (const item of cartItems) {
      subtotal += (item.quantity * item.products.price);
    }
    const totalFinal = subtotal + taxaEntrega;

    // 3. Cria o pedido na tabela 'orders'
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id,
        total_amount: totalFinal,
        delivery_address,
        payment_method,
        status: 'Aprovado'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 4. Prepara os itens para inserir na tabela 'order_items'
    const orderItemsToInsert = cartItems.map(item => ({
      order_id: orderData.id,
      product_id: item.products.id,
      quantity: item.quantity,
      price: item.products.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert);

    if (itemsError) throw itemsError;

    // 5. O pedido foi criado, então apagamos os itens do carrinho
    const { error: clearCartError } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user_id);

    if (clearCartError) throw clearCartError;

    res.status(201).json({ message: 'Pedido finalizado com sucesso!', orderId: orderData.id });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao processar pedido.', error: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    // Busca os pedidos do utilizador e, ao mesmo tempo, traz os itens de cada pedido (com o nome e imagem do produto)
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          quantity,
          price,
          products ( name, category )
        )
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar pedidos.', error: error.message });
  }
};

export const finalizarCompra = async (req, res) => {
  // Agora recebemos também o cupomId e o emailCliente (que podem vir vazios se não houver cupom)
  const { produtoId, quantidade, cupomId, emailCliente } = req.body;

  try {
    const { data: sucesso, error: errorEstoque } = await supabase
      .rpc('decrementar_estoque', { 
        produto_id: produtoId, 
        quantidade_comprada: quantidade 
      });

    if (errorEstoque) throw errorEstoque;

    if (!sucesso) {
      return res.status(400).json({ 
        message: 'Poxa, este produto esgotou ou não tem a quantidade solicitada!' 
      });
    }

    if (cupomId && emailCliente) {
      // Registra na tabela que este e-mail usou este cupom
      const { error: erroUso } = await supabase
        .from('coupon_usages')
        .insert([{ 
          cupom_id: cupomId, 
          email_cliente: emailCliente 
        }]);

      if (erroUso) {
        // Se der erro (ex: o cliente tentou burlar e mandou a mesma requisição 2x)
        console.error("Tentativa de uso duplicado do cupom", erroUso);
      } else {
        // Aumenta o contador de usos do cupom no banco
        await supabase.rpc('incrementar_uso_cupom', { 
          p_cupom_id: cupomId 
        });
      }
    }

    res.status(200).json({ message: 'Compra realizada com sucesso!' });

  } catch (error) {
    res.status(500).json({ message: 'Erro ao processar compra.', erro: error.message });
  }
};