const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const CampusCareRoutes = require('./Routes/CampusCareRoutes.js');
const app = express();
app.use(cors());
app.use(express.json()); // parse JSON bodies
app.use(cookieParser());
app.use('/', CampusCareRoutes);
app.get('/', (req, res) => {
  res.send('CampusCare API is running');
});

module.exports = app;