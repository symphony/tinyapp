const express = require("express");
const cookieParser = require('cookie-parser');
const util = require('util');

// == helper functions ==
const {
  generateUniqueId,
  autofillHttpPrefix,
  sendAlert,
  clearAlert,
  registerNewUser,
  isForbidden,
  getUserByEmail,
  getUsersUrls,
  } = require('./script');

// == our database ==
const users = {
  admin: {
    id: 'admin',
    email: 'admin',
    password: 'admin'
  },
};

const urlDatabase = {
  "b2xVn2": {
    id: 'b2xVn2',
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'admin'
  },
  "9sm5xK": {
    id: '9sm5xK',
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
  const urls = getUsersUrls(urlDatabase, user?.id);
  const templateVars = {
    user,
    urls,
    alertMsg: req.cookies.alertMsg,
    alertStyle: req.cookies.alertStyle
  };
  clearAlert(res);
  res.render('urls_index', templateVars);
});

// New url page
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

// ShortURL's details page
app.get('/urls/:id', (req, res) => {
  const user = users[req.cookies.user_id];
  const shortURL = urlDatabase[req.params.id];
  if (!user || !shortURL) return res.redirect('/url');
  if (user.id !== shortURL.userID) return res.redirect('/url');
  const templateVars = {
    user,
    shortURL,
    alertMsg: req.cookies.alertMsg,
    alertStyle: req.cookies.alertStyle
  };
  console.log('testing here', templateVars);
  res.render('urls_show', templateVars);
});

// actual shortURL redirection
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id]?.longURL;
  if (!longURL) return res.redirect('/url');
  res.redirect(longURL);
});

// register page
app.get('/register', (req, res) => {
  if (users[req.cookies.user_id]) return res.redirect('/urls');
  const templateVars = {
    alertMsg: req.cookies.alertMsg,
    alertStyle: req.cookies.alertStyle
  };
  res.render('register', templateVars);
});

// login page
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
// new account request
app.post('/register', (req, res) => {
  const email = req.body.email.trim();
  const password = req.body.password;

  // new account error handling
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

  // new account success
  registerNewUser(users, email, password);
  sendAlert(res, 'Successfully Registered!');
  res.redirect('/login');
});

// login request
app.post('/login', (req, res) => {
  const email = req.body.email.trim();
  const password = req.body.password;

  // login error handling
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

// New url request
app.post('/urls/new', (req, res) => {
  // new url permissions
  const userID = req.cookies.user_id;
  if (isForbidden(userID, users)) return res.sendStatus(403);

  // new url error handling
  const longURL = autofillHttpPrefix(req.body.longURL);
  if (!longURL) {
    sendAlert(res, 'Invalid URL', 'danger');
    return res.redirect('/urls/new');
  }

  // new url success
  const id = generateUniqueId(urlDatabase);
  urlDatabase[id] = {id, longURL, userID};
  sendAlert(res, 'Added new Short URL', 'success');
  res.redirect('/urls');
});

// Edit url
app.post('/urls/:id', (req, res) => {
  // edit permissions
  const userID = req.cookies.user_id;
  const shortURL = urlDatabase[req.params.id];
  if (isForbidden(userID, users)) return res.sendStatus(403);
  if (userID !== shortURL.userID) return res.sendStatus(403);

  // edit error handling
  const longURL = autofillHttpPrefix(req.body.longURL);
  if (!longURL) {
    sendAlert(res, 'Invalid URL', 'danger');
    return res.redirect('/urls/' + shortURL.id);
  }

  // edit success
  shortURL.longURL = longURL;
  sendAlert(res, 'Updated ' + shortURL.id);
  res.redirect('/urls/' + shortURL.id);
});

// Delete url
app.post('/urls/:id/delete', (req, res) => {
  // delete permissions
  const userID = req.cookies.user_id;
  const shortURL = urlDatabase[req.params.id];
  if (isForbidden(userID, users)) return res.sendStatus(403);
  if (userID !== shortURL.userID) return res.sendStatus(403);

  // delete success
  delete urlDatabase[shortURL.id];
  sendAlert(res, 'Successfully deleted ' + shortURL.id);
  res.redirect('/urls');
});


// == start server ==
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});