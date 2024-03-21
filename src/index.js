const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const router = require('./routes/index');
const { connectDB } = require('./config/connectDB');

require('dotenv').config();

const app = express();
const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200,
};
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

router(app);

connectDB();

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('🚀> Server is up and running on port : ' + port));
