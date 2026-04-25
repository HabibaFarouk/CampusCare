const express = require('express');
const todoRoutes = require('./routes/CampusCareRoutes.js');
const app = express();
app.use(express.json()); // parse JSON bodies
app.use('/campuscare', CampusCareRoutes); // every route inside todoRoutes is prefixed with /campuscare
app.get('/', (req, res) => {
  res.send('CampusCare API is running');
});