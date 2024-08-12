const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
// const csurf = require('csurf');
const bodyParser = require('body-parser');
const router = require('./routes/index');
const { connectDB } = require('./configs/connectDB');

require('dotenv').config();

const app = express();

// Security Middlewares
app.use(helmet());
// app.use(cors({ origin: ['https://iuh.io.vn:5000', 'https://iuh.io.vn:5001'] }));
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CSRF Protection
// const csrfProtection = csurf({ cookie: true });
// app.use(csrfProtection);

// Routes
router(app);

// Connect to DB
connectDB();

const port = process.env.PORT || 3001;
app.listen(port, () => console.log('🚀> Server is up and running on port : ' + port));
