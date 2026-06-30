module.exports = (err, req, res, next) => {
  console.error(err.stack); // full detail stays in server logs only

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Something went wrong'
    : err.message;

  res.status(statusCode).json({ message });
};