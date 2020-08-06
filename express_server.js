const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { findUserIDByEmail, urlsForUser } = require('./helperFunctions');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const generateRandomString = function () {
  return Math.random().toString(20).slice(2, 8);
};

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "aJ48lW"
  }
};

const userDB = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "email1@mail",
    password: "iAMyour1st"
  },
  "userRandomID2": {
    id: "userRandomID2",
    email: "email2@mail",
    password: "iAMyour2nd"
  }
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
  let userURLs = urlsForUser(urlDatabase, req.cookies.user_id);
  let templateVars = {
    urls: userURLs,
    email: null,
  };
  if (req.cookies.user_id) {
    templateVars.email = userDB[req.cookies.user_id].email;
  }
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {    // /urls/new before /urls:shortURL  to ensure correct routing specific > less specific
  let templateVars = {
    urls: urlDatabase,
    email: null,
  };
  if (req.cookies.user_id) {
    templateVars.email = userDB[req.cookies.user_id].email;
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.redirect(`https://http.cat/404`);
  } else if (!userDB[req.cookies.user_id]) {
    res.redirect('/login');
  } else if (urlDatabase[shortURL].userID !== req.cookies.user_id) {
    res.statusCode = 401;
    res.clearCookie('user_id');
    res.send("Unauthorized request, please login again.");
  } else {
    let templateVars = {
      shortURL,
      longURL: urlDatabase[shortURL].longURL,
      email: userDB[req.cookies.user_id].email,
    };
    res.render('urls_show', templateVars);
  }
});


app.get('/register', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    email: null,
  };
  if (req.cookies.user_id) {
    templateVars.email = userDB[req.cookies.user_id].email;
  }
  res.render('urls_register', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(302, longURL);
});

app.get("/login", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    email: null,
  };
  if (req.cookies.user_id) {
    templateVars.email = userDB[req.cookies.user_id].email;
  }
  res.render('urls_login', templateVars);
});

app.post("/login", (req, res) => {
  let userID = findUserIDByEmail(userDB, req.body.email);
  if (userID && req.body.password === userDB[userID].password) {
    res.cookie('user_id', userID);
    res.redirect(`/urls`);
  } else {
    res.statusCode = 403;
    res.send('Invalid login information');
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  let tempID = generateRandomString();
  let registerData = {
    id: tempID,
    email: req.body.email,
    password: req.body.password
  };
  if (!registerData.email || !registerData.password) {
    res.statusCode = 400;
    res.send("Registration failed. Email and/or Password cannot be empty");
  } else if (findUserIDByEmail(userDB, registerData.email)) {
    res.statusCode = 400;
    res.send("Registration failed. Email address already registered");
  } else {
    userDB[registerData.id] = registerData;
    res.cookie('user_id', registerData.id);
    res.redirect('/urls');
  }
});

// Create new shortURL
app.post("/urls", (req, res) => {
  let tempURL = generateRandomString();
  urlDatabase[tempURL] = {
    longURL: req.body.longURL,
    userID: req.cookies.user_id
  };
  res.redirect(`/urls/${tempURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  delete (urlDatabase[shortURL]);
  res.redirect(`/urls`);
});

// Edit request from individual URL page
app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
