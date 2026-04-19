const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// In-memory store for fallback
const MOCK_DB = {
  users: [],
  tickets: [],
  stations: [],
  passenger_logs: [],
  crowd_metrics: []
};

// Default to a local smartrail DB if no URL is provided
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/smartrail',
});

let useMock = false;

// Mock query function to simulate basic SQL behavior
const mockQuery = (text, params = []) => {
  console.log('[MOCK DB] Executing query:', text, params);
  
  // Basic Regex parsers for common queries in this app
  if (text.includes('SELECT * FROM users WHERE email = $1')) {
    const user = MOCK_DB.users.find(u => u.email === params[0]);
    return { rows: user ? [user] : [] };
  }
  
  if (text.includes('INSERT INTO users')) {
    const newUser = {
      id: MOCK_DB.users.length + 1,
      name: params[0],
      email: params[1],
      password: params[2],
      role: params[3] || 'user',
      created_at: new Date()
    };
    MOCK_DB.users.push(newUser);
    return { rows: [newUser] };
  }

  if (text.includes('INSERT INTO tickets')) {
    const newTicket = {
      id: params[0],
      user_id: params[1],
      line_id: params[2],
      from_station: params[3],
      to_station: params[4],
      passengers: params[5],
      cls: params[6],
      fare: params[7],
      status: 'active',
      created_at: new Date()
    };
    MOCK_DB.tickets.push(newTicket);
    return { rows: [newTicket] };
  }

  // Fallback for other queries
  return { rows: [] };
};

// Automatically setup schema if possible
const schemaPath = path.resolve(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

pool.query(schema)
  .then(() => {
    console.log('PostgreSQL Schema initialized.');
  })
  .catch(err => {
    console.warn('PostgreSQL Connection Failed. Falling back to IN-MEMORY MOCK DB.');
    console.warn('Reason:', err.message);
    useMock = true;
  });

// Export a proxy that decides between real pool and mock
module.exports = {
  query: (text, params) => {
    if (useMock) return Promise.resolve(mockQuery(text, params));
    return pool.query(text, params);
  },
  pool // expose raw pool if needed
};

