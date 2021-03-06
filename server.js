const express = require("express");
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const bcrypt = require('bcryptjs');

// == helper functions ==
const {
  generateUniqueId: generateUniqueID,
  autofillHttpPrefix,
  sendAlert,
  clearAlert,
  isForbidden,
  getUserByEmail,
  getUserURLs,
  trackVisit,
} = require('./helpers');

// == classes ==
class User {
  constructor(id, email, password) {
    this.id = id;
    this.email = email;
    this.password = password;
  }
}

class ShortURL {
  constructor(id, longURL, userID) {
    this.id = id;
    this.longURL = longURL;
    this.ownerID = userID;
    this.visits = [];
  }
  get hits() {
    return this.visits.length;
  }
  get uniqueVisitors() {
    const visitorIDs = Object.values(this.visits).map(({visitorID}) => visitorID);
    return new Set(visitorIDs).size;
  }
  addVisit(visitorID, timestamp) {
    this.visits.unshift({visitorID, timestamp});
  }
}

// == our databases ==
const users = {
  // account used for testing only
  // can be used with email 'admin' and password 'admin'
  admin: new User('admin', 'admin', '$2a$10$1iRy0u0g0yXrwChQktRNb.XtkiKb2csrShY2k9Rz8B2DUUjaaVkqW')
};

const urlDatabase = {
  'b2xVn2': new ShortURL('b2xVn2', 'http://www.lighthouselabs.ca', 'admin'),
  '9sm5xK': new ShortURL('9sm5xK', 'http://www.google.com', 'admin')
};

const publicIDs = {};


// == server config ==
const app = express();
const PORT = process.env.PORT || 3000;
app.set('view engine', 'ejs');


// == middleware ==
app.use("/styles", express.static(`${__dirname}/styles/`));
app.use(express.urlencoded({extended: false}));
app.use(methodOverride('_method'));
app.use(cookieParser()); // using for non encrypted cookies
app.use(cookieSession({ name: 'session', keys: ['top secret string'] }));


// == get request routing ==
// homepage
app.get('/', (req, res) => {
  const user = users[req.session.userID];
  if (user) return res.redirect('/urls');
  const templateVars = {
    alertMsg: req.cookies?.alertMsg,
    alertStyle: req.cookies?.alertStyle,
  };
  clearAlert(res);
  res.render('index', templateVars);
});


// user dashboard
app.get('/urls', (req, res) => {
  const user = users[req.session.userID];
  if (!user) return res.redirect('/login');
  const urls = getUserURLs(user?.id, urlDatabase);
  const templateVars = {
    user,
    urls,
    alertMsg: req.cookies?.alertMsg,
    alertStyle: req.cookies?.alertStyle,
  };
  clearAlert(res);
  res.render('urls_index', templateVars);
});


// new url page
app.get('/urls/new', (req, res) => {
  const user = users[req.session.userID];
  if (!user) {
    sendAlert(res, 'No Access', 'warning');
    return res.redirect('/login');
  }
  const templateVars = {
    user,
    alertMsg: req.cookies?.alertMsg,
    alertStyle: req.cookies?.alertStyle,
  };
  clearAlert(res);
  res.render("urls_new", templateVars);
});


// ShortURL's info page
app.get('/urls/:id', (req, res) => {
  const user = users[req.session.userID];
  const shortURL = urlDatabase[req.params.id];
  if (!user || !shortURL) {
    sendAlert(res, 'No Access', 'warning');
    return res.redirect('/urls');
  }
  if (user.id !== shortURL.ownerID) return res.redirect(401, '/urls');
  const templateVars = {
    user,
    shortURL,
    alertMsg: req.cookies?.alertMsg,
    alertStyle: req.cookies?.alertStyle,
  };
  clearAlert(res);
  res.render('urls_info', templateVars);
});


// login page
app.get('/login', (req, res) => {
  if (users[req.session.userID]) return res.redirect('/urls'); // user already logged in
  const templateVars = {
    alertMsg: req.cookies?.alertMsg,
    alertStyle: req.cookies?.alertStyle,
  };
  clearAlert(res);
  res.render('login', templateVars);
});


// register page
app.get('/register', (req, res) => {
  if (users[req.session.userID]) return res.redirect('/urls'); // user already logged in
  const templateVars = {
    alertMsg: req.cookies?.alertMsg,
    alertStyle: req.cookies?.alertStyle,
  };
  clearAlert(res);
  res.render('register', templateVars);
});


// actual shortURL redirection
app.get('/u/:id', (req, res) => {
  const shortURL = urlDatabase[req.params.id];
  if (!shortURL) {
    sendAlert(res, 'No URL with that ID', 'warning');
    return res.redirect('/');
  }
  trackVisit(req, res, shortURL, publicIDs);
  res.redirect(shortURL.longURL);
});


// 404
app.get('/error', (req, res) => {
  const user = users[req.session.userID];
  res.status(404).render('error', { user });
});


// forgiveness redirections
app.get('/url', (req, res) => {
  res.redirect('/urls');
});

app.get('/new', (req, res) => {
  res.redirect('/urls/new');
});

// Catch all
app.get('/*', (req, res) => {
  res.redirect('/error');
});


// == post requests ==
// login request
app.post('/login', (req, res) => {
  const email = req.body.email.trim();
  const password = req.body.password;

  // login error handling
  if (!email || !password) {
    sendAlert(res, 'Login failed', 'danger');
    return res.redirect('/login');
  }

  const user = getUserByEmail(email, users);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    sendAlert(res, 'Incorrect Login info', 'danger');
    return res.redirect('/login');
  }

  // login success
  req.session.userID = user.id;
  sendAlert(res, 'Signed in!');
  res.redirect('/urls');
});


// new account request
app.post('/register', (req, res) => {
  const email = req.body.email.trim();
  const password = req.body.password;

  // new account error handling
  if (!email || !password) {
    sendAlert(res, 'Please Try Again', 'warning');
    return res.redirect('/register');
  }
  if (getUserByEmail(email, users)) {
    sendAlert(res, 'Account already exists', 'danger');
    return res.redirect('/register');
  }
  if (password !== req.body.passwordRepeat) {
    sendAlert(res, 'Passwords do not match', 'warning');
    return res.redirect('/register');
  }

  // new account success - add to database
  const id = generateUniqueID(users);
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[id] = new User(id, email, hashedPassword);
  sendAlert(res, 'Successfully Registered!');
  res.redirect('/login');
});


// logout request
app.post('/logout', (req, res) => {
  req.session = null;
  sendAlert(res, 'Logged out', 'warning');
  res.redirect('/');
});


// New url request
app.post('/urls', (req, res) => {
  // new url permissions
  const userID = req.session.userID;
  if (isForbidden(userID, users)) return res.sendStatus(403);

  // new url error handling
  const longURL = autofillHttpPrefix(req.body.longURL);
  if (!longURL) {
    sendAlert(res, 'Invalid URL', 'danger');
    return res.redirect('/urls/new');
  }

  // new url success
  const id = generateUniqueID(urlDatabase);
  urlDatabase[id] = new ShortURL(id, longURL, userID);
  sendAlert(res, 'Added new Short URL', 'success');
  res.redirect('/urls');
});


// Edit url request
app.put('/urls/:id', (req, res) => {
  // edit permissions
  const userID = req.session.userID;
  const shortURL = urlDatabase[req.params.id];
  if (!shortURL) {
    sendAlert(res, 'ShortURL no longer exists', 'danger');
    return res.redirect('/urls/');
  }
  if (isForbidden(userID, users, shortURL)) return res.sendStatus(403);

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


// Delete url request
app.delete('/urls/:id', (req, res) => {
  // delete permissions
  const userID = req.session.userID;
  const shortURL = urlDatabase[req.params.id];
  if (!shortURL) {
    sendAlert(res, 'ShortURL no longer exists', 'danger');
    return res.redirect('/urls/');
  }
  if (isForbidden(userID, users, shortURL)) return res.sendStatus(403);

  // delete success
  delete urlDatabase[shortURL.id];
  sendAlert(res, 'Successfully deleted ' + shortURL.id);
  res.redirect('/urls');
});


// == start server ==
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});