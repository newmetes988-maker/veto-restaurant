const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

const handleDBDuplicate = (err) => {
  const field = err.detail?.match(/\((.*?)\)/)?.[1] || 'field';
  return new AppError(`Duplicate value for ${field}. Please use another value.`, 400);
};

const handleDBForeignKey = (err) => {
  return new AppError('Referenced record does not exist.', 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  logger.error('ERROR:', { message: err.message, code: err.code, stack: err.stack });
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: err.message || 'Something went wrong. Please try again later.',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    let error = Object.create(err);
    if (error.code === '23505') error = handleDBDuplicate(error);
    if (error.code === '23503') error = handleDBForeignKey(error);
    sendErrorDev(error, res);
  } else {
    let error = Object.create(err);
    if (error.code === '23505') error = handleDBDuplicate(error);
    if (error.code === '23503') error = handleDBForeignKey(error);
    if (error.name === 'ZodError') error = new AppError(error.errors.map((e) => e.message).join('. '), 400);
    sendErrorProd(error, res);
  }
};
