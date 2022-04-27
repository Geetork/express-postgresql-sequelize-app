const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const db = require('../database/models/index.js');
const jwToken = require('../middleware/token.js');

const usersRouter = express.Router();
usersRouter.use(bodyParser.json());

const jwtKey = process.env.JWT_SECRET_KEY;
const jwtExpirySeconds = 300;

usersRouter.route('/')
  .get((req, res, next) => {
    db.Posts.findAll().then((posts) => {
      res.render('index', {
        posts: posts,
        title: 'welcome'
      })
    })
  });

usersRouter.route('/signup')
  .get((req, res, next) => {
    res.render('index', {title: 'signup'});
  })
  .post((req, res, next) => {
    const username = req.body.user.login;
    const password = req.body.user.password;

    db.User.findOne({where: {login: username}})
    .then(user => {
      if (user) {res.status(401); throw new Error('This user already exists!');}
      else {
        db.User.create({
          login: username,
          password: password,
          createdAt: Date.now(),
          updatedAt: Date.now()
        })
        .then(user => {
          const token = jwToken.createToken(username, jwtKey, jwtExpirySeconds);
          res.cookie("token", token, { maxAge: jwtExpirySeconds * 1000 });
          res.redirect('/posts');
        });
      }
    })
    .catch(err => res.render('index', {title: 'signup', message: err.message}));
  });


usersRouter.route('/signin')
  .get((req, res, next) => {
    res.render('index', {title: 'signin'});
  })
  .post((req, res, next) => {
  	const username = req.body.user.login;
    const password = req.body.user.password;

    db.User.findOne({where: {login: username, password: password}})
    .then(user => {
      if (!user) {res.status(401); throw new Error('Not valid credentials!')}
      else {
        const token = jwToken.createToken(username, jwtKey, jwtExpirySeconds);
        res.cookie("token", token, { maxAge: jwtExpirySeconds * 1000 });
        res.redirect('/posts');
      }
    })
    .catch(err => res.render('index', {title: 'signin', message: err.message}));
});

usersRouter.route('/logout')
  .get((req, res, next) => {
    res.clearCookie('token');
    res.redirect('/');
  });

module.exports = usersRouter;
