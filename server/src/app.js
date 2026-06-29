const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/auth', require('./routes/auth.routes'));
app.use('/dashboard', require('./routes/dashboard.routes'));
app.use('/rooms', require('./routes/room.routes'));
app.use('/messbills', require('./routes/messBill.routes'));
app.use('/gatepass', require('./routes/gatepass.routes'));
app.use('/attendance', require('./routes/attendance.routes'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(require('./middleware/error.middleware'));


module.exports = app;