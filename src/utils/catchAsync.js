/**
 * Wraps async route handlers to forward errors to Express error middleware.
 * Eliminates need for try/catch in every controller.
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;
