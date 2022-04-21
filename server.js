const { generateUniqueId, autofillHttpPrefix, sendAlert, clearAlert } = require('./script');
const { registerNewUser, isForbidden, getUserByEmail } = require('./script');
const express = require("express");
const cookieParser = require('cookie-parser');

// == helper functions ==
// moved to script.js

// == our database ==
const users = {
  admin: {
    id: 'admin',
    email: 'admin',
    password: 'password'
  },
};

const urlDatabase = {
  "b2xVn2": {
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'admin'
  },
  "9sm5xK": {
    longURL: 'http://www.google.com',
    userID: 'admin'
  }
};


// == server config ==
const app = express();
const PORT = 3000;
app.set('view engine', 'ejs');

// == middleware ==
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use("/styles", express.static(`${__dirname}/styles/`));

// == get routing ==
// homepage
app.get('/urls', (req, res) => {
  const user = users[req.cookies.user_id];
  // const urls = Object.entries(urlDatabase).filter(([key, {userID}]) => (userID === user.id)).reduce(id, url);
  // console.log("filtered urls", urls);
  const templateVars = {
    user,
    urls: urlDatabase,
    alertMsg: req.cookies.alertMsg,
    alertStyle: req.cookies.alertStyle
  };
  clearAlert(res);
  res.render('urls_index', templateVars);
});

// 'create new url' page
app.get("/urls/new", (req, res) => {
  const user = users[req.cookies.user_id];
  if (!user) return res.redirect('/urls');
  const templateVars = {
    user,
    alertMsg: req.cookies.alertMsg,
    alertStyle: req.cookies.alertStyle
  };
  res.render("urls_new", templateVars);
});

// ShortURL's info/edit page
app.get('/urls/:id', (req, res) => {
  const user = users[req.cookies.user_id];
  const shortURL = req.params.id;
  if (!user || !urlDatabase[shortURL]) return res.redirect('/url');
  const templateVars = { user, shortURL, longURL: urlDatabase[shortURL].longURL };
  res.render('urls_show', templateVars);
});

// actual shortURL redirection
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id]?.longURL;
  if (!longURL) return res.redirect('/url');
  res.redirect(longURL);
});

app.get('/register', (req, res) => {
  if (users[req.cookies.user_id]) return res.redirect('/urls');
  const templateVars = {
    alertMsg: req.cookies.alertMsg,
    alertStyle: req.cookies.alertStyle
  };
  res.render('register', templateVars);
});

app.get('/login', (req, res) => {
  if (users[req.cookies.user_id]) return res.redirect('/urls');
  const templateVars = {
    alertMsg: req.cookies.alertMsg,
    alertStyle: req.cookies.alertStyle
  };
  res.render('login', templateVars);
});

// Catch all
app.get('/*', (req, res) => {
  res.redirect('/urls');
});


// == post requests ==
// register submission
app.post('/register', (req, res) => {
  const email = req.body.email.trim();
  const password = req.body.password;

  // error handling
  if (!email || !password) {
    sendAlert(res, 'Please Try Again', 'warning');
    return res.redirect('/register');
  }
  if (getUserByEmail(users, email)) {
    sendAlert(res, 'Account already exists', 'danger');
    return res.redirect('/register');
  }
  if (password !== req.body.passwordRepeat) {
    sendAlert(res, 'Passwords do not match', 'warning');
    return res.redirect('/register');
  }

  // submitted successfully
  registerNewUser(users, email, password);
  sendAlert(res, 'Successfully Registered!');
  res.redirect('/login');
});

// login request
app.post('/login', (req, res) => {
  const email = req.body.email.trim();
  const password = req.body.password;

  // error handling
  if (!email || !password) {
    sendAlert(res, 'Login failed', 'danger');
    return res.redirect('/login');
  }
  // lookup user id by email
  const user = getUserByEmail(users, email);
  if (!user || password !== user.password) {
    sendAlert(res, 'Incorrect Login info', 'danger');
    return res.redirect('/login');
  }

  // login success
  res.cookie('user_id', user.id);
  sendAlert(res, 'Login Success!');
  res.redirect('/urls');
});

// logout request
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  sendAlert(res, 'Logged out', 'warning');
  res.redirect('/urls');
});

// Add new url
app.post('/new', (req, res) => {
  if (isForbidden(req, users)) return res.sendStatus(403);
  const longURL = autofillHttpPrefix(req.body.longURL);
  const newId = generateUniqueId(urlDatabase);
  urlDatabase[newId] = { longURL, ...req.cookies.user_id};
  res.redirect('/urls');
});

// Edit url
app.post('/urls/:id', (req, res) => {
  if (isForbidden(req, users)) return res.sendStatus(403);
  const shortURL = req.params.id;
  const longURL = autofillHttpPrefix(req.body.longURL);
  urlDatabase[shortURL] = {longURL};
  sendAlert(res, 'Updated ' + shortURL);
  res.redirect('/urls/' + shortURL);
});

// Delete url
app.post('/urls/:id/delete', (req, res) => {
  if (isForbidden(req, users)) return res.sendStatus(403);
  delete urlDatabase[req.params.id];
  sendAlert(res, 'Successfully deleted ' + req.params.id);
  res.redirect('/urls');
});


// == start server ==
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});