const express = require("express");
const app = express();
const PORT = 3000;
const bodyParser = require("body-parser");

// config
app.set('view engine', 'ejs');

// middleware
app.use(bodyParser.urlencoded({extended: true}));

// our database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// functions
const generateRandomString = () => {
  const length = 6;
  const pool = [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  let newString = '';
  for (let i = 0; i < length; i++) {
    const ranIndex = Math.floor(Math.random() * pool.length);
    newString += Math.random() > 0.5 ? pool[ranIndex].toUpperCase() : pool[ranIndex];
  }

  // check if string already exists
  return Object.keys(urlDatabase).includes(newString) ? generateRandomString() : newString;
};

// routes
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get('/urls/:id', (req, res) => {
  const templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render('urls_show', templateVars);
});

app.get('/u/:shortID', (req, res) => {
  res.redirect(urlDatabase[req.params.shortID]);
});

app.get('/*', (req, res) => {
  res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  urlDatabase[generateRandomString()] = req.body.longURL;
  res.redirect('/urls');
});

// Start server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});