const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { findUserIDByEmail } = require('./helperFunctions');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const generateRandomString = function () {
  return Math.random().toString(20).slice(2, 8);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const userDB = {
  "userRandomID": {
    id: "userRandomID",
    email: "email1",
    password: "iAMyour1st"
  },
  "userRandomID2": {
    id: "userRandomID2",
    email: "email2",
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

  let templateVars = {
    urls: urlDatabase,
    email: null,
  };
  console.log(userDB[req.cookies.user_id]);
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
  }
  res.render('urls_new', templateVars);
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
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(302, longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.redirect(`https://http.cat/404`);
  } else {
    let templateVars = {
      shortURL,
      longURL: urlDatabase[shortURL],
      email: null,
    };
    if (req.cookies.user_id) {
      templateVars.email = userDB[req.cookies.user_id].email;
    }
    res.render('urls_show', templateVars);
  }
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
    console.log(userDB);
    res.cookie('user_id', registerData.id);
    res.redirect('/urls');
  }
});

app.post("/urls", (req, res) => {
  let tempURL = generateRandomString();
  urlDatabase[tempURL] = req.body.longURL;
  res.redirect(`/urls/${tempURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  delete (urlDatabase[shortURL]);
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
