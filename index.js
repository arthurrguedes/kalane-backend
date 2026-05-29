import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Importação das Rotas
import orderRoutes from './src/routes/orderRoutes.js';
import favoritesRoutes from './src/routes/favoritesRoutes.js';
import cartRoutes from './src/routes/cartRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import couponRoutes from './src/routes/couponRoutes.js';
import profileRoutes from './src/routes/profileRoutes.js';

dotenv.config();

const app = express();

// Configurações Globais
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Definição dos caminhos principais (Endpoints)
app.use('/auth', authRoutes);
app.use('/produtos', productRoutes);
app.use('/carrinho', cartRoutes);
app.use('/favoritos', favoritesRoutes);
app.use('/pedidos', orderRoutes);
app.use('/cupons', couponRoutes);
app.use('/perfil', profileRoutes);

// Iniciar Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor a rodar na porta ${PORT} 🚀`);
});