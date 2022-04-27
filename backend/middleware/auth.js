module.exports = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    res.redirect('/');
  }
  else {
    next();
  }
}
