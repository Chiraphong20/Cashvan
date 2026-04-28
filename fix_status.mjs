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
  
  const [result] = await connection.execute('UPDATE stores SET status = "SUCCESS" WHERE status = "SURVEYED"');
  console.log('Fixed stores:', result);
  connection.end();
}
run();
