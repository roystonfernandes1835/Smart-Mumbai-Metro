const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'smartrail.db');
const db = new sqlite3.Database(dbPath);

// Mimic the pg pool query API
const pool = {
  query: (text, params = []) => {
    return new Promise((resolve, reject) => {
      // Convert $1, $2, etc. to ?
      const sqliteText = text.replace(/\$(\d+)/g, '?');
      db.all(sqliteText, params, (err, rows) => {
        if (err) return reject(err);
        resolve({ rows });
      });
    });
  }
};

// Automatically setup schema
const schemaPath = path.resolve(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

db.exec(schema, (err) => {
  if (err) console.error('Error initializing SQLite schema:', err.message);
  else console.log('SQLite Database initialized.');
});

module.exports = pool;
