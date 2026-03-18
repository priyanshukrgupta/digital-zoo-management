const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/views', express.static(path.join(__dirname, 'views')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/animals', require('./routes/animals'));
app.use('/api/adoptions', require('./routes/adoptions'));
app.use('/api/medications', require('./routes/medications'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Serve HTML pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'views', 'register.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'views', 'dashboard.html')));
app.get('/animals', (req, res) => res.sendFile(path.join(__dirname, 'views', 'animals.html')));
app.get('/animal/:id', (req, res) => res.sendFile(path.join(__dirname, 'views', 'animal-detail.html')));
app.get('/adoptions', (req, res) => res.sendFile(path.join(__dirname, 'views', 'adoptions.html')));
app.get('/medications', (req, res) => res.sendFile(path.join(__dirname, 'views', 'medications.html')));
app.get('/reports',           (req, res) => res.sendFile(path.join(__dirname, 'views', 'reports.html')));
app.get('/ai-health',        (req, res) => res.sendFile(path.join(__dirname, 'views', 'ai-health.html')));
app.get('/zoo-map',          (req, res) => res.sendFile(path.join(__dirname, 'views', 'zoo-map.html')));
app.get('/leaderboard',      (req, res) => res.sendFile(path.join(__dirname, 'views', 'leaderboard.html')));
app.get('/simulation',       (req, res) => res.sendFile(path.join(__dirname, 'views', 'simulation.html')));
app.get('/qr-codes',         (req, res) => res.sendFile(path.join(__dirname, 'views', 'qr-codes.html')));
app.get('/world-map',        (req, res) => res.sendFile(path.join(__dirname, 'views', 'world-map.html')));
app.get('/birthdays',        (req, res) => res.sendFile(path.join(__dirname, 'views', 'birthdays.html')));
app.get('/activity-monitor', (req, res) => res.sendFile(path.join(__dirname, 'views', 'activity-monitor.html')));

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

// Make io accessible to routes
app.set('io', io);

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║    🦁 DIGITAL ZOO ADMIN SYSTEM 🦁     ║
║    Server running on port ${PORT}         ║
║    http://localhost:${PORT}/views/login.html             ║
╚════════════════════════════════════════╝
  `);
});

module.exports = { app, io };