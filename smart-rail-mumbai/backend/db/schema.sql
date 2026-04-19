-- Create Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id VARCHAR(255) PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  line_id VARCHAR(50) NOT NULL,
  from_station VARCHAR(255) NOT NULL,
  to_station VARCHAR(255) NOT NULL,
  passengers INTEGER DEFAULT 1,
  cls VARCHAR(50) NOT NULL,
  fare NUMERIC(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Stations table
CREATE TABLE IF NOT EXISTS stations (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  line_id VARCHAR(50) NOT NULL,
  lat NUMERIC(10, 6),
  lng NUMERIC(10, 6)
);

-- Create Passenger Logs (For analytics and real-time tracking)
CREATE TABLE IF NOT EXISTS passenger_logs (
  id SERIAL PRIMARY KEY,
  ticket_id VARCHAR(255) REFERENCES tickets(id),
  station_id VARCHAR(50) REFERENCES stations(id),
  action_type VARCHAR(50) NOT NULL, -- 'ENTRY' or 'EXIT'
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Crowd Metrics (Historical aggregations for ML)
CREATE TABLE IF NOT EXISTS crowd_metrics (
  id SERIAL PRIMARY KEY,
  station_id VARCHAR(50) REFERENCES stations(id),
  occupancy_count INTEGER NOT NULL,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
