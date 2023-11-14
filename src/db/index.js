import mysql from 'mysql2/promise';

let db = null;

export default async function executeQuery({ query, values }) {
  try {
    if (!db) {
      db = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        database: process.env.MYSQL_DATABASE,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD
      });
    }

    db.connect();
    const results = await db.query(query, values);
    await db.end();
    return results;
  } catch (error) {
    return { error };
  }
}