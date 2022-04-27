const express = require('express');
const bodyParser = require('body-parser');
const db = require('../database/models/index.js');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const path = require('path');
const jwToken = require('../middleware/token.js');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'frontend/public/uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const postsRouter = express.Router();
postsRouter.use(bodyParser.json());

postsRouter.route('/posts')
  .get((req, res, next) => {
    db.Posts.findAll()
    .then(posts => {
      let username = jwToken.decodeToken(req.cookies.token, process.env.JWT_SECRET_KEY);
      res.render('posts', {posts: posts, title: 'posts', cookie: req.cookies.token, user: username});
    })
  })
  .post((req, res, next) => {
    let upload = multer({ storage: storage }).single('pic');

    upload(req, res, function(err) {

        if (req.fileValidationError) {
            return res.send(req.fileValidationError);
        }
        else if (!req.file) {
            return res.send('Please select an image to upload');
        }
        else if (err instanceof multer.MulterError) {
            return res.send(err);
        }
        else if (err) {
            return res.send(err);
        };

        let username = jwToken.decodeToken(req.cookies.token, process.env.JWT_SECRET_KEY);

        db.Posts.create({
          author: username,
          title: req.body.post.title,
          description: req.body.post.description,
          url: 'uploads/' + req.file.filename,
          createdAt: Date.now(),
          updatedAt: Date.now()
        })
        .then(() => {
          db.Posts.findAll()
          .then(posts => {
            let username = jwToken.decodeToken(req.cookies.token, process.env.JWT_SECRET_KEY);
            res.render('posts', {posts: posts, title: 'posts', cookie: req.cookies.token, user: username});
          })
          }
        );
    });
  });

postsRouter.route('/posts/:postId')
  .post((req, res, next) => {
    const id = (req.params.postId.replace(/[^0-9]/g,""));

    let username = jwToken.decodeToken(req.cookies.token, process.env.JWT_SECRET_KEY);

    db.Posts.destroy({ where: {
      id: id,
      author: username
    }})
    .then(() => {
      db.Posts.findAll()
      .then(posts => {
        res.redirect('/posts');
      })
      });
  });

postsRouter.route('/posts/:postId/edit')
  .get((req, res, next) => {
    const id = (req.params.postId.replace(/[^0-9]/g,""));
    db.Posts.findOne({ where: {
      id: id
    }})
    .then(post => {
      let username = jwToken.decodeToken(req.cookies.token, process.env.JWT_SECRET_KEY);
      if (username != post.author) res.redirect('/posts')
      else
        res.render('edit', {post: post, title: 'edit', cookie: req.cookies.token});
    });
  })
  .post((req, res, next) => {
    let url;
    const id = (req.params.postId.replace(/[^0-9]/g,""));

    let upload = multer({ storage: storage }).single('pic');

    upload(req, res, function(err) {

        if (req.fileValidationError) {
            return res.send(req.fileValidationError);
        }
        else if (err instanceof multer.MulterError) {
            return res.send(err);
        }
        else if (err) {
            return res.send(err);
        }
        else if (!req.file) {
          db.Posts.update({
            title: req.body.post.title,
            description: req.body.post.description,
            updatedAt: Date.now(),
          }, { where: { id: id }})
          .then(
            db.Posts.findAll()
            .then(posts => {
              res.redirect('/posts');
            })
          );
        }
        else {
          db.Posts.update({
            title: req.body.post.title,
            description: req.body.post.description,
            url: 'uploads/' + req.file.filename,
            updatedAt: Date.now()
          }, { where: { id: id }})
          .then(
            db.Posts.findAll()
            .then(posts => {
              res.redirect('/posts');
            })
          );
        }
    });
  })


module.exports = postsRouter;
