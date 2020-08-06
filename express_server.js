const PORT = 8080;

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

const { findUserIDByEmail, urlsForUser, generateRandomString } = require('./helperFunctions');
const { urlDatabase, userDB } = require('./database');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'Waffle',
  keys: ['neroIStheBEST']
}));


app.get("/", (req, res) => {
  if (!req.session.userId) {
    res.redirect('/login');
  } else {
    res.redirect('/urls');
  }
});

app.get("/urls", (req, res) => {
  if (!req.session.userId) {
    res.status(401).send(`Error! <a href="/login">Login</a> required.`);
  } else if (!userDB[req.session.userId]) {
    req.session.userId = null;
    res.redirect('/login');
  } else {
    let userURLs = urlsForUser(urlDatabase, req.session.userId);
    let templateVars = {
      urls: userURLs,
      email: null,
    };
    if (req.session.userId) {
      templateVars.email = userDB[req.session.userId].email;
    }
    res.render('urls_index', templateVars);
  }
});

app.get("/urls/new", (req, res) => {    // /urls/new before /urls:shortURL  to ensure correct routing specific > less specific
  let templateVars = {
    urls: urlDatabase,
    email: null,
  };
  if (req.session.userId) {
    templateVars.email = userDB[req.session.userId].email;
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.status(404).redirect(`https://http.cat/404`);
  } else if (!userDB[req.session.userId]) {
    res.status(401).send('Login required to view page. --> <a href="/login">LOGIN HERE</a>');
  } else if (urlDatabase[shortURL].userID !== req.session.userId) {
    res.statusCode = 401;
    req.session.userId = null;
    res.send(`Unauthorized request, please login . --> <a href="/login">LOGIN HERE</a>`);
  } else {
    let templateVars = {
      shortURL,
      longURL: urlDatabase[shortURL].longURL,
      email: userDB[req.session.userId].email,
    };
    res.render('urls_show', templateVars);
  }
});


app.get('/register', (req, res) => {
  if (req.session.userId) {
    res.redirect('/urls');
  } else {
    let templateVars = {
      urls: urlDatabase,
      email: null,
    };
    res.render('urls_register', templateVars);
  }
});

app.get('/u/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    let longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(302, longURL);
  } else {
    res.status(404).redirect(`https://http.cat/404`);
  }
});

app.get("/login", (req, res) => {
  if (req.session.userId) {
    res.redirect('/urls');
  } else {
    let templateVars = {
      urls: urlDatabase,
      email: null,
    };
    res.render('urls_login', templateVars);
  }
});

app.post("/login", (req, res) => {
  let userID = findUserIDByEmail(userDB, req.body.email);
  if (userID && bcrypt.compareSync(req.body.password, userDB[userID].password)) {
    req.session.userId = userID;
    res.redirect(`/urls`);
  } else if (userID) {
    res.status(400).send(`Incorrect password --> <a href="/login">LOGIN HERE</a>`);
  } else {
    res.status(404).send(`Email not registered --> <a href="/register">REGISTER HERE</a>`);
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/");
});

// New user registration
app.post("/register", (req, res) => {
  let tempID = generateRandomString();
  if (!req.body.email || !req.body.password) {
    res.status(400).send(`Registration failed. Email and/or Password cannot be empty --> <a href="/regiser">Try Again</a>`);
  } else if (findUserIDByEmail(userDB, req.body.email)) {
    res.status(400).send(`Registration failed. Email address already registered --> <a href="/login">LOGIN HERE</a>`);
  } else {
    const hash = bcrypt.hashSync(req.body.password, 10);
    let registerData = {
      id: tempID,
      email: req.body.email,
      password: hash,
    };
    userDB[registerData.id] = registerData;
    req.session.userId = registerData.id;
    res.redirect('/urls');
    console.log(registerData);
  }
});

// Create new shortURL
app.post("/urls", (req, res) => {
  if (req.session.userId) {
    let tempURL = generateRandomString();
    urlDatabase[tempURL] = {
      longURL: req.body.longURL,
      userID: req.session.userId
    };
    res.redirect(`/urls/${tempURL}`);
  } else {
    res.statusCode = 401;
    req.session.userId = null;
    res.send(`Unauthorized request, please login . --> <a href="/login">LOGIN HERE</a>`);
  }
});

// Delete URLs
app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  if (req.session.userId && req.session.userId === urlDatabase[shortURL].userID) {
    delete (urlDatabase[shortURL]);
    res.redirect(`/urls`);
  } else {
    res.statusCode = 401;
    req.session.userId = null;
    res.send(`Unauthorized request, please login . --> <a href="/login">LOGIN HERE</a>`);
  }
});

// Edit request from individual URL page
app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  if (req.session.userId && req.session.userId === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect(`/urls`);
  } else {
    res.statusCode = 401;
    req.session.userId = null;
    res.send(`Unauthorized request, please login . --> <a href="/login">LOGIN HERE</a>`);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
