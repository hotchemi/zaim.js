const Zaim = require("./lib/zaim");
var readlineSync = require("readline-sync");
const zaim = new Zaim({
  consumerKey: "consumerKey",
  consumerSecret: "consumerSecret",
  callback: "callback"
});
zaim.getAuthorizationUrl(function(url) {
  console.log(url);
  input = readlineSync.question(); //入力待ち
  zaim.getOAuthAccessToken(input, function(err, token, secret, results) {
    zaim.setAccessToken(token);
    zaim.setAccessTokenSecret(secret);
    console.error(zaim);
    zaim.getMoney(data => {
      console.log("------");
      console.log(data);
      zaim.getCategories(data => {
        console.log("------");
        console.log(data);
        zaim.getCurrencies(data => {
          console.log("------");
          console.log(data);
        });
      });
    });
  });
});
