const sqlite3 = require('sqlite3');
const path = require('path');
const dbPath = path.resolve(__dirname, 'db', 'smartrail.db');
const db = new sqlite3.Database(dbPath);

console.log('Seeding data to populate the Admin Dashboard...');
const stationsTraffic = [
  { name: 'Andheri', count: 4200 },
  { name: 'Ghatkopar', count: 3800 },
  { name: 'Dadar', count: 3100 },
  { name: 'BKC', count: 2900 },
  { name: 'WEH', count: 1500 }
];

db.serialize(() => {
  db.run("BEGIN TRANSACTION");
  
  // Seed a base user
  const bcrypt = require('bcryptjs');
  const hash = bcrypt.hashSync('mumbaimetro', 10);
  db.run(`INSERT OR IGNORE INTO users (id, name, email, password, role) VALUES (1, 'Admin', 'admin@smartrail.com', '${hash}', 'admin')`);

  // Add bulk tickets to reach total tickets 12,450
  // active tickets 342, revenue 452,000 approx
  
  // We'll insert a few representative summary rows instead of 12k distinct rows
  // Wait, SUM() and COUNT() count the rows physically. 
  // Inserting 12,450 rows in SQLite inside a transaction takes < 1 second.
  
  for(let i=0; i < 12450; i++) {
     let status = i < 342 ? 'active' : 'completed';
     let fare = 36.305; // Quick math to get ~452000 total
     db.run(`INSERT INTO tickets (id, user_id, line_id, from_station, to_station, fare, status, cls) 
             VALUES ('TKT${i}', 1, '1', 'A', 'B', ${fare}, '${status}', 'second')`);
  }

  // Seed passenger logs to match traffic chart
  for(let station of stationsTraffic) {
    for(let i=0; i < station.count; i++) {
        db.run(`INSERT INTO passenger_logs (ticket_id, station_id, action_type) VALUES ('TKT0', '${station.name}', 'ENTRY')`);
    }
  }

  db.run("COMMIT", (err) => {
    if (err) console.error("Error committing:", err);
    else console.log("Seeding complete. Refresh your dashboard!");
  });
});
