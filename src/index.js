const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const router = require('./routes/index');
const { connectDB } = require('./configs/connectDB');

require('dotenv').config();

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

router(app);

connectDB();

const port = process.env.PORT || 3001;
app.listen(port, () => console.log('🚀> Server is up and running on port : ' + port));
