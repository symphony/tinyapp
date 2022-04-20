const { generateRandomString, autofillHttpPrefix } = require('./script');
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

// == config ==
const app = express();
const PORT = 3000;
const sendAlert = [false, '', ''];
app.set('view engine', 'ejs');

const defaultUrls = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const enableAlert = (message, style = 'info') => {
  sendAlert[0] = true;
  sendAlert[1] = message;
  sendAlert[2] = style;
};

const disableAlert = () => {
  sendAlert[0] = false;
  sendAlert[1] = '';
};

const createNewUser = (name) => {
  database[name] = {
    name,
    urls: {...defaultUrls},
  };
};

// == our database ==
const database = {
  admin: {
    name: 'admin',
    urls: {...defaultUrls},
  }
};

// == middleware ==
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// == get routing ==
// homepage
app.get('/urls', (req, res) => {
  const username = req.cookies.username;
  if (!database[username]) createNewUser(username);
  const templateVars = {
    username,
    urls: database[username].urls,
    sendAlert,
  };
  res.render('urls_index', templateVars);
  disableAlert();
});

// 'create new url' page
app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies.username };
  res.render("urls_new", templateVars);
});

// ShortURL's info/edit page
app.get('/urls/:id', (req, res) => {
  const username = req.cookies.username;
  const shortURL = req.params.id;
  const templateVars = { username, shortURL, longURL: database[username].urls[shortURL] };
  res.render('urls_show', templateVars);
});

// actual shortURL redirection
app.get('/u/:id', (req, res) => {
  const userUrls = database[req.cookies.username].urls;
  res.redirect(userUrls[req.params.id]);
});

// Catch all
app.get('/*', (req, res) => {
  res.redirect('/urls');
});


// == post requests ==
// login routing
app.post('/login', (req, res) => {
  const username = req.body.username.trim();
  if (!username) {
    enableAlert('Login failed', 'warning');
    return res.redirect('url');
  }
  res.cookie('username', username);
  enableAlert('Login Success!');
  res.redirect('url');
  console.log(req.cookies.username, 'logged in');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  enableAlert('Logged out', 'warning');
  res.redirect('url');
});

// Add new url
app.post('/new', (req, res) => {
  const userUrls = database[req.cookies.username].urls;
  const newId = generateRandomString(userUrls);
  const longURL = autofillHttpPrefix(req.body.longURL);
  userUrls[newId] = longURL;
  res.redirect('/urls');
});

// Edit url
app.post('/urls/:id', (req, res) => {
  const userUrls = database[req.cookies.username].urls;
  const shortURL = req.params.id;
  const longURL = autofillHttpPrefix(req.body.longURL);
  userUrls[shortURL] = longURL;
  res.redirect('/urls/' + shortURL);
});

// Delete url
app.post('/urls/:id/delete', (req, res) => {
  delete database[req.cookies.username].urls[req.params.id];
  res.redirect('/urls');
});


// == start server ==
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});