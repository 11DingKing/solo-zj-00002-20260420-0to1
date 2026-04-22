import express from 'express';
import cors from 'cors';
import pool from './config/database.js';
import productRoutes from './routes/products.js';
import transactionRoutes from './routes/transactions.js';
import dashboardRoutes from './routes/dashboard.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

app.use(cors());
app.use(express.json({ charset: 'utf-8' }));

app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Inventory Management API is running' });
});

const testDatabaseConnection = async () => {
  let retries = 10;
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  while (retries > 0) {
    try {
      const connection = await pool.getConnection();
      console.log('Database connection successful!');
      connection.release();
      return true;
    } catch (error) {
      retries--;
      console.log(`Database connection failed. Retries left: ${retries}`);
      console.error('Error:', error.message);
      if (retries > 0) {
        await delay(3000);
      }
    }
  }
  
  throw new Error('Failed to connect to database after multiple retries');
};

const startServer = async () => {
  try {
    await testDatabaseConnection();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
