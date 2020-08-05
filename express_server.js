const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

const generateRandomString = function () {
  let string = "";
  let base = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let pool = base.split('');
  for (let i = 0; i < 6; i++) {
    string += pool[Math.ceil(Math.random() * 62)];
  }
  return string;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {    // /urls/new before /urls:shortURL  to ensure correct routing specific > less specific
  res.render('urls_new');
});

app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(302, longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.redirect(`https://http.cat/404`);
  } else {
    let templateVars = { shortURL, longURL: urlDatabase[shortURL] };
    res.render('urls_show', templateVars);
  }
});

app.post("/urls", (req, res) => {
  //let requestURL = longURL;
  //console.log(req.body);
  //console.log(req.body.longURL);
  let tempURL = generateRandomString();
  //console.log(tempURL);
  urlDatabase[tempURL] = req.body.longURL;
  res.redirect(`/urls/${tempURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  delete (urlDatabase[shortURL]);
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
