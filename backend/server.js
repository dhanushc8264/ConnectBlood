//  COMMONJS IMPORTS (important for Jest)
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDb = require('./config/db');
const authRoutes = require('./routes/AuthRoutes');
const bloodRequestRoutes = require('./routes/requestRoutes');
const donationRoutes = require('./routes/donationRoutes');
const userProfileRoutes = require('./routes/userProfile');
const uploadRoutes = require('./routes/uploadRoutes');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const base_url = process.env.CLIENT_URL;

//  CONNECT DB ONLY IF NOT TEST
if (process.env.NODE_ENV !== 'test') {
  connectDb();
}

const PORT = process.env.PORT || 8000;

const app = express();
const server = http.createServer(app);

//  SOCKET SETUP
const io = new Server(server, {
  cors: {
    origin: base_url,
    credentials: true,
  },
});

// EXPORT io (for other files)
module.exports.io = io;

//  MIDDLEWARES
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: base_url,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  })
);

//  TRACK CONNECTED USERS
const connectedDonors = new Map();
module.exports.connectedDonors = connectedDonors;

//  SOCKET EVENTS
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('registerDonor', ({ userId, blood_group, location }) => {
    connectedDonors.set(socket.id, { userId, blood_group, location });
    console.log(`Registered donor: (${userId})`);
  });

  socket.on('newDonationRequest', (data) => {
    socket.broadcast.emit('newDonationRequest', data);
  });

  socket.on('donationStatusUpdated', (data) => {
    socket.broadcast.emit('donationStatusUpdated', data);
  });

  socket.on('disconnect', () => {
    connectedDonors.delete(socket.id);
    console.log('User disconnected:', socket.id);
  });
});

//  ROUTES
app.get('/', (req, res) => {
  res.send('Blood donation running successfully');
});

app.use('/api/auth', authRoutes);
app.use('/api/bloodrequest', bloodRequestRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/user', userProfileRoutes);
app.use('/api', uploadRoutes);

//  EXPORT APP (VERY IMPORTANT FOR TESTING)
module.exports = app;

//  START SERVER ONLY IN NON-TEST ENV
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log('Server started successfully on port', PORT);
  });
}
