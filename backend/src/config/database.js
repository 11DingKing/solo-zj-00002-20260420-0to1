import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root123456',
  database: process.env.DB_NAME || 'inventory_management',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

export const getConnection = async () => {
  const connection = await pool.getConnection();
  await connection.query("SET NAMES 'utf8mb4'");
  await connection.query("SET CHARACTER SET utf8mb4");
  await connection.query("SET character_set_connection=utf8mb4");
  return connection;
};

export default pool;
