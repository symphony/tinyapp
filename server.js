const { generateRandomString, autofillHttpPrefix } = require('./script');
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

// == config ==
const app = express();
const PORT = 3000;
let successAlert = false;
app.set('view engine', 'ejs');

// == our database ==
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// == middleware ==
app.use(bodyParser.urlencoded({extended: true}));

// == get routing ==
// homepage
app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    successAlert,
    signedIn: res.cookie,
  };
  successAlert = false;
  res.render('urls_index', templateVars);
});

// 'create new url' page
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// ShortURL's info/edit page
app.get('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  const templateVars = { shortURL, longURL: urlDatabase[shortURL] };
  res.render('urls_show', templateVars);
});

// actual shortURL redirection
app.get('/u/:shortURL', (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

// Catch all
app.get('/*', (req, res) => {
  res.redirect('/urls');
});


// == post requests ==
// login routing
app.post('/login', (req, res) => {
  res.cookie = req.body.username;
  successAlert = true;
  res.redirect('url');
});

// Add new url
app.post('/new', (req, res) => {
  autofillHttpPrefix(req, res);
  const newId = generateRandomString(urlDatabase);
  urlDatabase[newId] = req.body.longURL;
  res.redirect('/urls');
});

// Edit url
app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;
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