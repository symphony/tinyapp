const { generateUniqueId, autofillHttpPrefix, enableAlert, clearAlert, registerNewUser } = require('./script');
const express = require("express");
const cookieParser = require('cookie-parser');

// == helper functions ==
// moved to script.js

// == our database ==
const users = {
  admin: {
    id: 'admin',
    email: 'admin@tinyurl.com',
    password: 'verysecurepassword'
  },
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

// ShortURL's info/edit page
app.get('/urls/:id', (req, res) => {
  const user = users[req.cookies.user_id];
  const shortURL = req.params.id;
  const templateVars = { user, shortURL, longURL: urlDatabase[shortURL] };
  res.render('urls_show', templateVars);
});

// actual shortURL redirection
app.get('/u/:id', (req, res) => {
  res.redirect(urlDatabase[req.params.id]);
});

app.get('/register', (req, res) => {
  const user = users[req.cookies.user_id];
  if (user) return res.redirect('/urls');
  const templateVars = {
    alertMsg: req.cookies.alertMsg,
    alertStyle: req.cookies.alertStyle
  };
  res.render('register', templateVars);
});

app.get('/login', (req, res) => {
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
  console.log("users before", users);
  const email = req.body.email.trim();
  const password = req.body.password;

  // error handling
  if (!email || !password) {
    enableAlert(res, 'Please Try Again', 'warning');
    return res.redirect('/register');
  }
  if (Object.values(users).some(user => user.email === email)) {
    enableAlert(res, 'Account already exists', 'danger');
    return res.redirect('/register');
  }
  if (password !== req.body.passwordRepeat) {
    enableAlert(res, 'Passwords do not match', 'warning');
    return res.redirect('/register');
  }

  // submitted successfully
  registerNewUser(users, email, password);
  enableAlert(res, 'Successfully Registered!');
  res.redirect('/login');
  console.log("users after", users);
});

// login routing
app.post('/login', (req, res) => {
  const email = req.body.email.trim();
  const password = req.body.password;

  // error handling
  if (!email || !password) {
    enableAlert(res, 'Login failed', 'danger');
    return res.redirect('/login');
  }
  // lookup user id by email
  const userId = Object.keys(users).find(id => users[id].email === email);
  console.log("id", userId);

  if (!userId || password !== users[userId].password) {
    enableAlert(res, 'Incorrect Login info', 'danger');
    return res.redirect('/login');
  }

  // login success
  res.cookie('user_id', userId);
  enableAlert(res, 'Login Success!');
  console.log(email, 'logged in');
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  enableAlert(res, 'Logged out', 'warning');
  res.redirect('/urls');
});

// Add new url
app.post('/new', (req, res) => {
  const longURL = autofillHttpPrefix(req.body.longURL);
  const newId = generateUniqueId(urlDatabase);
  urlDatabase[newId] = longURL;
  res.redirect('/urls');
  console.log("urls", urlDatabase);
});

// Edit url
app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  const longURL = autofillHttpPrefix(req.body.longURL);
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls/' + shortURL);
});

// Delete url
app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});



// == start server ==
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});