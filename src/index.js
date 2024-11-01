const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const router = require('./routes/index');
const { connectDB } = require('./configs/connectDB');

require('dotenv').config();

const app = express();

// Security Middlewares
app.use(helmet());
app.use(
    cors({
        origin: [
            'https://stu.iuh.io.vn:5000', // student client host
            'https://lec.iuh.io.vn:5000', // lecturer client host
            'http://localhost:5174', // student client local
            'http://localhost:5173', // lecturer client local
        ],
    }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
router(app);

// Connect to DB
connectDB();

const port = process.env.PORT || 3001;
app.listen(port, () => console.log('🚀> Server is up and running on port : ' + port));
