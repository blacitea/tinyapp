
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

const { findUserIDByEmail, urlsForUser, generateRandomString, loggedUser } = require('./helperFunctions');
const { urlDatabase, userDB } = require('./database');
const { PORT, unloggedUser, unauthUser, loginRequired } = require('./const');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'Waffle',
  keys: ['neroIStheBEST']
}));


app.get("/", (req, res) => {
  if (loggedUser(req)) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get("/urls", (req, res) => {
  if (!loggedUser(req)) {
    res.status(401).send(loginRequired);
  } else if (!userDB[loggedUser(req)]) {
    req.session = null;
    res.redirect('/login');
  } else {
    let userURLs = urlsForUser(urlDatabase, loggedUser(req));
    let templateVars = {
      urls: userURLs,
      email: userDB[loggedUser(req)].email,
    };
    res.render('urls_index', templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  if (loggedUser(req)) {
    let templateVars = {
      email: userDB[loggedUser(req)].email,
    };
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.status(404).redirect(`https://http.cat/404`);
  } else if (!userDB[loggedUser(req)]) {
    res.status(401).send(loginRequired);
  } else if (urlDatabase[shortURL].userID !== loggedUser(req)) {
    res.statusCode = 401;
    req.session = null;
    res.send(unauthUser);
  } else {
    let templateVars = {
      shortURL,
      longURL: urlDatabase[shortURL].longURL,
      email: userDB[loggedUser(req)].email,
      create: urlDatabase[shortURL].create
    };
    res.render('urls_show', templateVars);
  }
});


app.get('/register', (req, res) => {
  if (loggedUser(req)) {
    res.redirect('/urls');
  } else {
    res.render('urls_register', unloggedUser);
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
  if (loggedUser(req)) {
    res.redirect('/urls');
  } else {
    res.render('urls_login', unloggedUser);
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
  if (loggedUser(req)) {
    let tempURL = generateRandomString();
    urlDatabase[tempURL] = {
      longURL: req.body.longURL,
      userID: loggedUser(req),
      create: new Date().toLocaleDateString(),
    };
    res.redirect(`/urls/${tempURL}`);
  } else {
    res.statusCode = 401;
    req.session = null;
    res.send(unauthUser);
  }
});

// Delete URLs
app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  if (loggedUser(req) && loggedUser(req) === urlDatabase[shortURL].userID) {
    delete (urlDatabase[shortURL]);
    res.redirect(`/urls`);
  } else {
    res.statusCode = 401;
    req.session = null;
    res.send(unauthUser);
  }
});

// Edit request from individual URL page
app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  if (loggedUser(req) && loggedUser(req) === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect(`/urls`);
  } else {
    res.statusCode = 401;
    req.session = null;
    res.send(unauthUser);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
