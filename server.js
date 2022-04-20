const { generateUniqueId, autofillHttpPrefix } = require('./script');
const express = require("express");
const cookieParser = require('cookie-parser');

// == config ==
const app = express();
const PORT = 3000;
app.set('view engine', 'ejs');

const defaultUrls = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const enableAlert = (res, message = '', style = 'info') => {
  res.cookie('alertMsg', message);
  res.cookie('alertStyle', style);
};

const clearAlert = (res) => {
  res.clearCookie('alertMsg');
  res.clearCookie('alertStyle');
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
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use("/styles", express.static(`${__dirname}/styles/`));

// == get routing ==
// homepage
app.get('/urls', (req, res) => {
  const username = req.cookies.username;
  if (!database[username]) createNewUser(username);
  const templateVars = {
    username,
    urls: database[username].urls,
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
  const templateVars = { username, shortURL, longURL: database[username].urls[shortURL] };
  res.render('urls_show', templateVars);
});

// actual shortURL redirection
app.get('/u/:id', (req, res) => {
  const userUrls = database[req.cookies.username].urls;
  res.redirect(userUrls[req.params.id]);
});

app.get('/register', (req, res) => {
  const username = req.cookies.username;
  const templateVars = { username };
  res.render('register', templateVars);
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
    enableAlert(res, 'Login failed', 'danger');
    return res.redirect('url');
  }
  res.cookie('username', username);
  enableAlert(res, 'Login Success!');
  console.log(username, 'logged in');
  res.redirect('url');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  enableAlert(res, 'Logged out', 'warning');
  res.redirect('url');
});

// Add new url
app.post('/new', (req, res) => {
  const userUrls = database[req.cookies.username].urls;
  const longURL = autofillHttpPrefix(req.body.longURL);
  const newId = generateUniqueId(userUrls);
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

app.post('/register', (req, res) => {
  const email = req.body.email.trim();
  const password = req.body.password;
  enableAlert(res, 'Successfully Registered!');
  console.log(email, 'registered');
  res.redirect('url');
});


// == start server ==
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});