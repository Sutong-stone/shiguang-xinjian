import { createConnection } from "mysql2";
import { config } from "dotenv";

config();

const c = createConnection(process.env.DATABASE_URL!);

const tables = [
  `CREATE TABLE IF NOT EXISTS albums (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    imageUrl TEXT NOT NULL,
    isVideo BIGINT UNSIGNED DEFAULT 0,
    date VARCHAR(50),
    category VARCHAR(50),
    createdAt TIMESTAMP DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS messages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    authorName VARCHAR(255) NOT NULL,
    authorId BIGINT UNSIGNED DEFAULT 0 NOT NULL,
    createdAt TIMESTAMP DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS milestones (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date VARCHAR(50) NOT NULL,
    icon VARCHAR(50) DEFAULT 'star' NOT NULL,
    createdAt TIMESTAMP DEFAULT NOW() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS cover_settings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    imageUrl TEXT NOT NULL,
    title VARCHAR(255) DEFAULT '拾光信笺' NOT NULL,
    subtitle VARCHAR(255) DEFAULT '记录成长的每一刻' NOT NULL,
    updatedAt TIMESTAMP DEFAULT NOW() NOT NULL
  )`,
];

async function run() {
  for (const sql of tables) {
    await new Promise<void>((resolve, reject) => {
      c.query(sql, (err) => {
        if (err) { console.error("SQL error:", err.message); reject(err); }
        else { console.log("Table created"); resolve(); }
      });
    });
  }
  console.log("All tables created!");
  c.end();
}

run().catch(console.error);
