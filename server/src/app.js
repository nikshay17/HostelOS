const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const { generalLimiter } = require('./middleware/rateLimiter.middleware');

const app = express();
const allowedOrigins = (process.env.CLIENT_ORIGIN || process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(helmet()); // sets secure HTTP headers
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // base64 images from face recognition need a higher limit than default
app.use(mongoSanitize()); // strips $ and . from request data to prevent NoSQL injection
app.use(hpp()); // protects against HTTP parameter pollution
app.use(generalLimiter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(require('./middleware/error.middleware'));
app.use('/auth', require('./routes/auth.routes'));
app.use('/dashboard', require('./routes/dashboard.routes'));
app.use('/rooms', require('./routes/room.routes'));
app.use('/messbills', require('./routes/messBill.routes'));
app.use('/gatepass', require('./routes/gatepass.routes'));
app.use('/attendance', require('./routes/attendance.routes'));
app.use('/face', require('./routes/faceAuth.routes'));
app.use('/feedback', require('./routes/feedback.routes'));
app.use('/notifications', require('./routes/notification.routes'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(require('./middleware/error.middleware'));
app.use('/complaints', require('./routes/complaint.routes'));

app.use('/analytics', require('./routes/analytics.routes'));
module.exports = app;

app.use('/security', require('./routes/security.routes'));