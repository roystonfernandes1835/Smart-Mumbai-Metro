const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/ticket');
const crowdRoutes = require('./routes/crowd');
const adminRoutes = require('./routes/admin');
const qrRoutes = require('./routes/qr');
const routesApi = require('./routes/routes');

const app = express();
const server = http.createServer(app);

// Setup Socket.IO for real-time crowd updates
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json());

// Pass io to routes via middleware
app.use((req, res, next) => { req.io = io; next(); });

app.use('/auth', authRoutes);
app.use('/tickets', ticketRoutes);
app.use('/crowd', crowdRoutes);
app.use('/admin', adminRoutes);
app.use('/qr', qrRoutes);
app.use('/routes', routesApi);

// Socket.io connections
io.on('connection', (socket) => {
  console.log('Client connected for real-time updates:', socket.id);
  // Send mock initial live crowd payload just to establish baseline
  socket.emit('crowd_update', { stationId: 'Andheri', level: 'HIGH', count: 450 });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Smart Rail V2 Backend started on port ${PORT}`);
});
