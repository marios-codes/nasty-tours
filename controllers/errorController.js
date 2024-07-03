const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateKeyErrorDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:\\.|[^\\])*?\1/)[0];
  const message = `Duplicate field: ${value}. Please use another value.`;

  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJsonWebTokenError = (err) =>
  new AppError('Invalid token. Please login again.', 401);

const handleTokenExpiredError = (err) =>
  new AppError('your token has expired. Please login again.', 401);

const sendErrorDev = (err, req, res) => {
  // Check if it is an API error or a server side page rendering error
  // to send the corresponding response, so
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // API
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  // B) Render the error page
  console.error('ERROR', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      // a) Operational or trusted error => send it to the client
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // b) Programming or other unkown error => don't leak the details to the client
    // 1) Log the error
    console.error('ERROR', err);
    // 2) Send generic error message
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
  // B) Render the error page
  if (err.isOperational) {
    // a) Operational or trusted error => send it to the client
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }
  // b) Programming or other unkown error => don't leak the details to the client
  console.error('ERROR', err);
  // Send generic error message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: 'Please try again later.',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.create(err);
    if (error.name === 'CastError') error = handleCastErrorDB(err);
    if (error.code === 11000) error = handleDuplicateKeyErrorDB(err);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (error.name === 'JsonWebTokenError') error = handleJsonWebTokenError();
    if (error.name === 'TokenExpiredError') error = handleTokenExpiredError();

    sendErrorProd(error, req, res);
  }

  next();
};
