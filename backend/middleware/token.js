const jwt = require('jsonwebtoken');

function decodeToken (token, secret) {
  const decoded = jwt.verify(token, secret);

  return decoded.username;
}

function createToken (username, secret, time) {
  const token = jwt.sign({ username }, secret, {
    algorithm: "HS256",
    expiresIn: time,
  });

  return token;
}

module.exports = { decodeToken, createToken };
