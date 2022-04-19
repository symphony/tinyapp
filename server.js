const express = require("express");
const app = express();
const PORT = 3000;
const bodyParser = require("body-parser");
const { generateRandomString } = require('./scripts');

// config
app.set('view engine', 'ejs');

// our database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// middleware
app.use(bodyParser.urlencoded({extended: true}));

// routes
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  const templateVars = { shortURL, longURL: urlDatabase[shortURL] };
  res.render('urls_show', templateVars);
});

app.get('/u/:shortID', (req, res) => {
  res.redirect(urlDatabase[req.params.shortID]);
});

app.get('/*', (req, res) => {
  res.redirect('/urls');
});

// Add new url
app.post('/urls', (req, res) => {
  const newId = generateRandomString(urlDatabase);
  urlDatabase[newId] = req.body.longURL;
  res.redirect('/urls' + newId);
});

// Edit url
app.put('/urls', (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.newURL;
  res.redirect('/urls');
});

// Delete url
app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

// Start server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});