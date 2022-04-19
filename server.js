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

app.post('/urls', (req, res) => {
  urlDatabase[req.body.name] = req.body.name;
  urlDatabase[req.body.longURL] = req.body.longURL;
  res.send('Ok');
});

// Start server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});