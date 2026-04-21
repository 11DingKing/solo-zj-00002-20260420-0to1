import express from 'express';
import cors from 'cors';
import productRoutes from './routes/products.js';
import transactionRoutes from './routes/transactions.js';
import dashboardRoutes from './routes/dashboard.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Inventory Management API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
