/**
 * Module dependencies.
 */
var oauth = require('oauth');

/**
 * Constructor.
 *
 * @param {object} params
 */
function Zaim(params) {
  if (!params.consumerKey || !params.consumerSecret) {
    throw new Error("ConsumerKey and secret must be configured.");
  }

  this.consumerKey = params.consumerKey;
  this.consumerSecret = params.consumerSecret;
  this.token = params.accessToken;
  this.secret = params.accessTokenSecret;
  this.callback = params.callback;
  this.client = new oauth.OAuth(
    'https://api.zaim.net/v1/auth/request',
    'https://api.zaim.net/v1/auth/access',
    this.consumerKey,
    this.consumerSecret,
    '1.0',
    this.callback,
    "HMAC-SHA1"
  );
}

/**
 * Get authorization url.
 *
 * @return {string} authorization url.
 */
Zaim.prototype.getAuthorizationUrl = function() {
  var that = this;
  if (!this.consumerKey || !this.consumerSecret || !this.callback) {
    throw new Error("ConsumerKey, secret and callback url must be configured.");
  }
  this.client.getOAuthRequestToken(function(err, token, secret) {
    that.token = token;
    that.secret = secret;
  });
  return 'https://www.zaim.net/users/auth?oauth_token=' + this.token;
};

/**
 * Get oauth access token.
 *
 * @param {string} pin
 * @param {Function} callback
 */
Zaim.prototype.getOAuthAccessToken = function(pin, callback) {
  if (!this.consumerKey || !this.consumerSecret) {
    throw new Error("ConsumerKey and secret must be configured.");
  }
  this.client.getOAuthAccessToken(this.token, this.secret, pin, callback);
};

/**
 * Set accessToken.
 *
 * @param {string} token
 */
Zaim.prototype.setAccessToken = function(token) {
  this.token = token;
};

/**
 * Set accessTokenSecret.
 *
 * @param {string} secret
 */
Zaim.prototype.setAccessTokenSecret = function(secret) {
  this.secret = secret;
};

/**
 * Get credentials.
 *
 * @param {function} callback
 */
Zaim.prototype.getCredentials = function(callback) {
  var url = "https://api.zaim.net/v1/user/verify_credentials.json";
  this._httpGet(url, callback);
};

/**
 * Create payment.
 *
 * @param {object} params
 * @param {Function} callback
 */
Zaim.prototype.createPay = function(params, callback) {
  var url = "https://api.zaim.net/v1/pay/create.json";
  params.date = params.date || this._getCurrentDate();
  if (!params.category_id || !params.genre_id || !params.price) {
    throw new Error("Invalid parameters.category_id, genre_id and price are necessary.");
  }
  this._httpPost(url, params, callback);
};

/**
 * Create income.
 *
 * @param {object} params
 * @param {Function} callback
 */
Zaim.prototype.createIncome = function(params, callback) {
  var url = "https://api.zaim.net/v1/income/create.json";
  params.date = params.date || this._getCurrentDate();
  if (!params.category_id || !params.price) {
    throw new Error("Invalid parameters.category_id and price are necessary.");
  }
  this._httpPost(url, params, callback);
};

/**
 * Get money.
 *
 * @param {object} params
 * @param {Function} callback
 */
Zaim.prototype.getMoney = function(params, callback) {
  var url = "https://api.zaim.net/v1/money/index.json";
  if (arguments.length === 1) {
    callback = params;
    params = {};
  }
  this._httpPost(url, params, callback);
};

/**
 * Get payment categories.
 *
 * @param {object} params
 * @param {Function} callback
 */
Zaim.prototype.getPayCategories = function(params, callback) {
  var url = "https://api.zaim.net/v1/category/pay.json";
  if (arguments.length === 1) {
    callback = params;
    params = {};
  }
  this._httpPost(url, params, callback);
};

/**
 * Get income categories.
 *
 * @param {object} params
 * @param {Function} callback
 */
Zaim.prototype.getIncomeCategories = function(params, callback) {
  var url = 'https://api.zaim.net/v1/category/income.json';
  if (arguments.length === 1) {
    callback = params;
    params = {};
  }
  this._httpPost(url, params, callback);
};

/**
 * Get payment genres.
 *
 * @param {object} params
 * @param {Function} callback
 */
Zaim.prototype.getPayGenres = function(params, callback) {
  var url = 'https://api.zaim.net/v1/genre/pay.json';
  if (arguments.length === 1) {
    callback = params;
    params = {};
  }
  this._httpPost(url, params, callback);
};

/**
 * Get currencies.
 *
 * @param {function} callback
 */
Zaim.prototype.getCurrencies = function(callback) {
  var url = 'https://api.zaim.net/v1/currency/index.json';
  this._httpGet(url, callback);
};

/**
 * Execute http get.
 *
 * @api private
 * @param {string} url
 * @param {Function} callback
 */
Zaim.prototype._httpGet = function(url, callback) {
  if (!this.token || !this.secret) {
    throw new Error("accessToken and tokenSecret must be configured.");
  }
  this.client.get(url, this.token, this.secret, function(err, data) {
    callback(typeof data === 'string' ? JSON.parse(data) : data, err);
  });
};

/**
 * Execute http post.
 *
 * @api private
 * @param {string} url
 * @param {object} params
 * @param {Function} callback
 */
Zaim.prototype._httpPost = function(url, params, callback) {
  if (!this.token || !this.secret) {
    throw new Error("accessToken and tokenSecret must be configured.");
  }
  this.client.post(url, this.token, this.secret, params, function(err, data) {
    callback(typeof data === 'string' ? JSON.parse(data) : data, err);
  });
};

/**
 * Get current date.
 *
 * @api private
 * @return {string} ex)2013-4-9
 */
Zaim.prototype._getCurrentDate = function() {
  var date = new Date();
  return date.getYear() % 1900 + 1900 + '-' + (date.getMonth() + 1) + '-' + date.getDate();
};

/**
 * Exports.
 */
exports = module.exports = Zaim;