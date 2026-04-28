import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });
  const [rows] = await connection.query('SELECT @@global.time_zone, @@session.time_zone, NOW() as current_time_db');
  console.log(rows);
  connection.end();
}
run();
