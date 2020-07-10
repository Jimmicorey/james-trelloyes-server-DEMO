/* eslint-disable eqeqeq */
/* eslint-disable strict */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */

require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { v4: uuidv4 } = require('uuid');
const { NODE_ENV } = require('./config');
const cardRouter = require('./card/card-router');
const listRouter = require('./list/list-router');

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(cors());
app.use(helmet());


// VALIDATE AUTH API_TOKEN
app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('Authorization');

  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    logger.error(`Unauthorized request to path: ${req.path}`);
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  // move to the next middleware
  next();
});

// CARD and LIST ROUTERS USED AFTER AUTH VALIDATION
app.use(cardRouter);
app.use(listRouter);


app.get('/', (req, res) => {
  res.send('Hello, world!');
});


// ERROR HANDLING
app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error ' }};
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});


module.exports = app;