const express = require('express');
const CampusCareRoutes = require('./Routes/CampusCareRoutes.js');
const app = express();
app.use(express.json()); // parse JSON bodies
app.use('/', CampusCareRoutes);
app.get('/', (req, res) => {
  res.send('CampusCare API is running');
});

module.exports = app;