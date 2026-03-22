const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
require('dotenv').config();
const { passport } = require('./config/passport');

const app = express();

app.use(helmet());
app.use(express.json());
app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        origin === "http://localhost:5173" ||
        /\.vercel\.app$/.test(new URL(origin).hostname)
      ) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
});

app.use(session({
  secret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
}));

app.use(passport.initialize());
app.use(passport.session());


app.use('/api/auth/login', loginLimiter);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'user-service' });
});

module.exports = app;
