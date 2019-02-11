/**
 * Module dependencies.
 */
var oauth = require("oauth");

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
    "https://api.zaim.net/v2/auth/request",
    "https://api.zaim.net/v2/auth/access",
    this.consumerKey,
    this.consumerSecret,
    "1.0",
    this.callback,
    "HMAC-SHA1"
  );
}

/**
 * Get authorization url.
 *
 * @param {Function} callback
 */
Zaim.prototype.getAuthorizationUrl = function(callback) {
  var that = this;
  if (!this.consumerKey || !this.consumerSecret || !this.callback) {
    throw new Error("ConsumerKey, secret and callback url must be configured.");
  }
  this.client.getOAuthRequestToken(function(err, token, secret) {
    that.token = token;
    that.secret = secret;
    callback("https://auth.zaim.net/users/auth?oauth_token=" + that.token);
  });
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
Zaim.prototype.verify = function(callback) {
  var url = "https://api.zaim.net/v2/home/user/verify";
  this._httpGet(url, {}, callback);
};

/**
 * Create payment.
 *
 * @param {object} params
 * @param {Function} callback
 */
Zaim.prototype.createPay = function(params, callback) {
  var url = "https://api.zaim.net/v2/home/money/payment";
  params.date = params.date || this._getCurrentDate();
  if (
    !params.category_id ||
    !params.genre_id ||
    !params.amount ||
    !params.date
  ) {
    throw new Error(
      "Invalid parameters.category_id, genre_id and price are necessary."
    );
  }
  if (!params.mapping) {
    params.mapping = 1;
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
  var url = "https://api.zaim.net/v2/home/money/income";
  params.date = params.date || this._getCurrentDate();
  if (!params.category_id || !params.amount || !params.date) {
    throw new Error("Invalid parameters.category_id and price are necessary.");
  }
  if (!params.mapping) {
    params.mapping = 1;
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
  var url = "https://api.zaim.net/v2/home/money";
  if (arguments.length === 1) {
    callback = params;
    params = {};
  }
  if (!params.mapping) {
    params.mapping = 1;
  }
  this._httpGet(url, params, callback);
};

/**
 * Get payment categories.
 *
 * @param {object} params
 * @param {Function} callback
 */
Zaim.prototype.getCategories = function(params, callback) {
  var url = "https://api.zaim.net/v2/home/category";
  if (arguments.length === 1) {
    callback = params;
    params = {};
  }
  if (!params.mapping) {
    params.mapping = 1;
  }
  this._httpGet(url, params, callback);
};

/**
 * Get currencies.
 *
 * @param {function} callback
 */
Zaim.prototype.getCurrencies = function(callback) {
  var url = "https://api.zaim.net/v2/currency";
  this._httpGet(url, {}, callback);
};

/**
 * Execute http get.
 *
 * @api private
 * @param {string} url
 * @param {Function} callback
 */
Zaim.prototype._httpGet = function(url, params, callback) {
  if (!this.token || !this.secret) {
    throw new Error("accessToken and tokenSecret must be configured.");
  }
  url += "?";
  Object.keys(params).forEach(function(key) {
    url += key + "=" + params[key] + "&";
  });
  url.slice(0, -1);
  this.client.get(url, this.token, this.secret, function(err, data) {
    if (err) {
      throw err;
    } else {
      callback(typeof data === "string" ? JSON.parse(data) : data);
    }
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
    if (err) {
      throw err;
    } else {
      callback(typeof data === "string" ? JSON.parse(data) : data);
    }
  });
};

/**
 * Get current date.
 *
 * @api private
 * @return {string} ex) 2013-4-9
 */
Zaim.prototype._getCurrentDate = function() {
  var date = new Date();
  return (
    (date.getYear() % 1900) +
    1900 +
    "-" +
    (date.getMonth() + 1) +
    "-" +
    date.getDate()
  );
};

/**
 * Exports.
 */
module.exports = Zaim;
