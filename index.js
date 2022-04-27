const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

require('dotenv').config();

const users = require('./backend/routes/usersRouter');
const posts = require('./backend/routes/postsRouter');
const auth = require('./backend/middleware/auth');

const app = express();
const port = process.env.PORT || 3000;

app.set('views', path.join(__dirname, '/frontend/views'));
app.set('view engine', 'ejs')

app.use(express.static((__dirname + '/frontend/public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extented: true}));
app.use(cookieParser());

app.use(users);
app.use(auth);
app.use(posts);

app.listen(port, function() {
  console.log("Listening on " + port);
});
