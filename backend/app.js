const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoute = require('./api/collections');
const PORT = 8080;

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', apiRoute);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`App listening on port ${PORT}`);
});