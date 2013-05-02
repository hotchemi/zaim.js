Zaim.js [![Build Status](https://secure.travis-ci.org/hotchemi/zaim.js.png)](http://travis-ci.org/hotchemi/zaim.js)
=======

Node.js library for the Zaim API.

##Install
Install from npm:

    $ npm install zaim

##Usage
Please see [API doc](https://dev.zaim.net/home/api) for further details.

###Constructor
```javascript
var Zaim = require('zaim');

var zaim = new Zaim({
  // must configure consumer key and secret
  consumerKey: 'CONSUMER KEY',
  consumerSecret: 'CONSUMER SECRET',
  // option params
  accessToken: 'ACCESS TOKEN',
  accessTokenSecret: 'ACCESS TOKEN SECRET',
  callback: 'CALLBACK URL'
});
```
###Authorization url
```javascript
zaim.getAuthorizationUrl(function(url) {
  // https://www.zaim.net/users/auth?oauth_token=***
  console.log(url);
});
```
###Get access token and Secret
```javascript
zaim.getOAuthAccessToken(pin, function(err, token, secret, results) {
  console.log(token); //access token
  console.log(secret); //access token secret
});
```
###Set access token and secret
```javascript
zaim.setAccessToken('accessToken');
zaim.setAccessTokenSecret('accessTokenSecret');
```
###User
```javascript
zaim.getCredentials(function(data, err) {
  console.log(data);
});
```
###Create payment
```javascript
zaim.createPay({
  category_id: 'category_id', //required
  genre_id: 'genre_id', //required
  price: 100, //required
  date: '2013-04-10',
  comment: 'comment: memo (within 100 characters)',
  active: 'public or private（0:private 1:public, default is 0）'
}, function(data, err){
  console.log(data);
});
```
###Create income
```javascript
zaim.createIncome({
  category_id: 'category_id', //required
  price: 100, //required
  date: '2013-04-10',
  comment: 'comment: memo (within 100 characters)',
  active: 'public or private（0:private 1:public, default is 0）'
}, function(data, err){
  console.log(data);
});
```
###Get money
```javascript
zaim.getMoney({
  category_id: 'narrow down by category_id',
  genre_id: 'narrow down by genre_id',
  type: 'narrow down by type (pay or income)',
  order: 'sort by id or date (default : date)',
  start_date: 'the first date (Y-m-d format)',
  end_date: 'the last date (Y-m-d format)',
  page: 'number of current page (default 1)',
  limit: 'number of items per page (default 20, max 100)'
}, function(data, err) {
  console.log(data);
});
```
or
```javascript
zaim.getMoney(function(data, err) {
  console.log(data);
});
```
###Get payment categories
```javascript
zaim.getPayCategories({
  lang: 'If you set this parameter with "ja", response title becomes Japanese.'
}, function(data, err) {
  console.log(data);
});
```
or
```javascript
zaim.getPayCategories(function(data, err) {
  console.log(data);
});
```
###Get income categories
```javascript
zaim.getIncomeCategories({
  lang: 'If you set this parameter with "ja", response title becomes Japanese.'
}, function(data, err) {
  console.log(data);
});
```
or
```javascript
zaim.getIncomeCategories(function(data, err) {
  console.log(data);
});
```
###Get payment genres
```javascript
zaim.getPayGenres({
  lang: 'If you set this parameter with "ja", response title becomes Japanese.'
}, function(data, err) {
  console.log(data);
});
```
or
```javascript
zaim.getPayGenres(function(data, err) {
  console.log(data);
});
```
###Get currencies
```javascript
zaim.getCurrencies(function(data, err) {
  console.log(data);
});
```
##Test

    $ npm test

## Release note
* 2013/04/09 0.0.1 release.
* 2013/04/30 0.0.7 release.
* 2013/04/30 0.0.9 release.

##Link
* https://dev.zaim.net/home/api
* https://npmjs.org/package/zaim
* http://hotchemi.github.io/zaim.js