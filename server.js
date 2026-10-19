'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();
process.env.NODE_ENV = 'test';

const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');

const app = express();

const getFilePath = (folder, file) => {
  const p1 = path.join(__dirname, folder, file);
  if (fs.existsSync(p1)) return p1;
  return path.join(process.cwd(), folder, file);
};

// Security / Caching headers middleware
app.use(function (req, res, next) {
  res.setHeader('x-powered-by', 'PHP 4.2.0');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

const publicDir = fs.existsSync(path.join(__dirname, 'public'))
  ? path.join(__dirname, 'public')
  : path.join(process.cwd(), 'public');
app.use('/public', express.static(publicDir));
app.use(cors({ origin: '*' })); // USED FOR FCC TESTING PURPOSES ONLY!

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB if connection string is provided
if (process.env.DB) {
  mongoose.connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(function () {
    console.log('Connected to MongoDB');
  }).catch(function (err) {
    console.error('Database connection error:', err.message);
  });
}

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(getFilePath('views', 'index.html'));
  });

// For FCC testing purposes
fccTestingRoutes(app);

// Routing for API
apiRoutes(app);

// 404 Not Found Middleware
app.use(function (req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

// Start our server and tests!
if (!process.env.VERCEL) {
  const port = process.env.PORT || 3000;
  const listener = app.listen(port, function () {
    console.log('Your app is listening on port ' + listener.address().port);
    if (process.env.NODE_ENV === 'test') {
      console.log('Running Tests...');
      setTimeout(function () {
        try {
          runner.run();
        } catch (e) {
          console.log('Tests are not valid:');
          console.error(e);
        }
      }, 1500);
    }
  });
  listener.on('error', function (err) {
    if (err.code !== 'EADDRINUSE') {
      console.error(err);
    }
  });
}

module.exports = app; // for unit/functional testing
