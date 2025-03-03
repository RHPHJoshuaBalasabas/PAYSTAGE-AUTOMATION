const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const TelegramBot = require('node-telegram-bot-api');
const csvFilePath = "cypress/textDatas/exchangeCurrencyResult.csv";
const fs = require("node:path")
// const fetch = require('node-fetch');
// const formData = new FormData();


const app = express();

// if (config.env !== 'test') {
//   app.use(morgan.successHandler);
//   app.use(morgan.errorHandler);
// }

// set security HTTP headers
// app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// // sanitize request data
// app.use(xss());
// app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// limit repeated failed requests to auth endpoints
// if (config.env === 'production') {
//   app.use('/v1/auth', authLimiter);      
// }
console.log(fs.resolve(("cypress/textDatas/")))

app.post("/notify", (req, res) => {
  const token = '8197648428:AAEF8Br0O8wJEpWGp4iYJtSdq0J4jdtPfgg';

  // Create a bot that uses 'polling' to fetch new updates
  const bot = new TelegramBot(token, { polling: true });

  console.log(req.body)
  bot.sendMessage("-4761895963", req.body.message);
  // Sending the document
  // const projectPath = Cypress.config('projectRoot')
  bot.sendDocument("-4761895963", "../../cypress/e2e/Reports/BalanceChecker/Settlement_Balance.xlsx");
  return res.status(200).send("ok");
})

// app.post("/notify-success", (req, res) => {
//   const token = '8164178426:AAG5LuwudLgVX6CtEALUwQiWq6yZhgbOnbY';

//   // Create a bot that uses 'polling' to fetch new updates
//   const bot = new TelegramBot(token, { polling: true });

//   console.log(req.body)
//   bot.sendMessage("-4783844203", req.body.message);
//   return res.status(200).send("ok");
// })

// v1 api routes
// app.use('/v1', routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;