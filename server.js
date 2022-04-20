const { generateUniqueId, autofillHttpPrefix } = require('./script');
const express = require("express");
const cookieParser = require('cookie-parser');

// == helper functions ==
const enableAlert = (res, message = '', style = 'info') => {
  res.cookie('alertMsg', message);
  res.cookie('alertStyle', style);
};

const clearAlert = (res) => {
  res.clearCookie('alertMsg');
  res.clearCookie('alertStyle');
};

const registerNewUser = (email, password) => {
  const id = generateUniqueId(users);
  users[id] = {
    id,
    email,
    password
  };
};

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
  const username = req.cookies.username;
  const templateVars = {
    username,
    urls: urlDatabase,
    alertMsg: req.cookies.alertMsg,
    alertStyle: req.cookies.alertStyle
  };
  clearAlert(res);
  res.render('urls_index', templateVars);
});

// 'create new url' page
app.get("/urls/new", (req, res) => {
  if (!req.cookies.username) return res.redirect('/urls');
  const templateVars = { username: req.cookies.username };
  res.render("urls_new", templateVars);
});

// ShortURL's info/edit page
app.get('/urls/:id', (req, res) => {
  const username = req.cookies.username;
  const shortURL = req.params.id;
  const templateVars = { username, shortURL, longURL: urlDatabase[shortURL] };
  res.render('urls_show', templateVars);
});

// actual shortURL redirection
app.get('/u/:id', (req, res) => {
  res.redirect(urlDatabase[req.params.id]);
});

app.get('/register', (req, res) => {
  const username = req.cookies.username;
  if (username) return res.redirect('/urls');
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
  const email = req.body.email.trim();
  const password = req.body.password;
  if (!email || !password) {
    enableAlert(res, 'Please Try Again', 'warning');
    return res.redirect('/register');
  }
  if (password !== req.body.passwordRepeat) {
    enableAlert(res, 'Passwords do not match', 'warning');
    return res.redirect('/register');
  }
  registerNewUser(email, password);
  enableAlert(res, 'Successfully Registered!');
  console.log(email, 'registered');
  res.redirect('/urls');
});

// login routing
app.post('/login', (req, res) => {
  const username = req.body.email.trim();
  const password = req.body.password;
  if (!username || !password) {
    enableAlert(res, 'Login failed', 'danger');
    return res.redirect('/login');
  }
  res.cookie('username', username);
  enableAlert(res, 'Login Success!');
  console.log(username, 'logged in');
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  enableAlert(res, 'Logged out', 'warning');
  res.redirect('/urls');
});

// Add new url
app.post('/new', (req, res) => {
  const longURL = autofillHttpPrefix(req.body.longURL);
  const newId = generateUniqueId(urlDatabase);
  urlDatabase[newId] = longURL;
  res.redirect('/urls');
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