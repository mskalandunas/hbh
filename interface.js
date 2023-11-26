import sqlite from 'sqlite3';
import { config } from 'dotenv';

const { DB_NAME } = config().parsed;

const sqlite3 = sqlite.verbose();

const db = new sqlite3.Database(DB_NAME);

db.all('SELECT * FROM pages', [], (err, rows) => {
  if (err) {
    throw err;
  }
  rows.forEach(row => {
    console.log(row.id, row.title);
    console.log('HTML Content:', row.html_content.toString());
  });
});

db.close();