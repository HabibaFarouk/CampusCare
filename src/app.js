const express = require('express');
const cookieParser = require('cookie-parser');
const CampusCareRoutes = require('./Routes/CampusCareRoutes.js');
const app = express();
app.use(express.json()); // parse JSON bodies
app.use(cookieParser());
app.use('/', CampusCareRoutes);
app.get('/', (req, res) => {
  res.send('CampusCare API is running');
});

module.exports = app;