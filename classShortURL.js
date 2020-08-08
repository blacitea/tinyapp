class ShortURL {
  constructor(shortURL, longURL, userID) {
    this.shortURL = shortURL;
    this.longURL = longURL;
    this.userID = userID;
    this.create = new Date().toDateString();
    this.history = [];
    this.cookie = this.createVisitorID();
  }
  createVisitorID() {
    let visitNum = 0;
    return function() {
      visitNum += 1;
      return `${this.shortURL}${visitNum}`;
    };
  }
  addHistory(user) {
    let visitor = this.cookie();
    this.history.push({
      timeStamp: new Date().toLocaleString(),
      visitor,
      userCookie: user,
    });
  }
  get totalVisits() {
    return this.history.length;
  }

  get uniqueVisits() {
    let unique = [];
    for (let visit of this.history) {
      if (!unique.includes(visit.userCookie)) {
        unique.push(visit.userCookie);
      }
    }
    return unique.length;
  }
}

module.exports = {
  ShortURL,
};