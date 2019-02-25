/**
 * Module dependencies.
 */
var oauth = require("oauth");

type RequestCallbackFunction = (
  { statusCode: number, data: any },
  data: any,
  response: any
) => void;
/**
 * Constructor.
 *
 * @param {object} params
 */
export default class Zaim {
  consumerKey: string;
  consumerSecret: string;
  token: string;
  secret: string;
  callback: RequestCallbackFunction;
  client = oauth.OAuth;
  constructor(params) {
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
  getAuthorizationUrl(callback) {
    var that = this;
    if (!this.consumerKey || !this.consumerSecret || !this.callback) {
      throw new Error(
        "ConsumerKey, secret and callback url must be configured."
      );
    }
    this.client.getOAuthRequestToken(function(err, token, secret) {
      that.token = token;
      that.secret = secret;
      callback("https://auth.zaim.net/users/auth?oauth_token=" + that.token);
    });
  }

  /**
   * Get oauth access token.
   *
   * @param {string} pin
   * @param {Function} callback
   */
  getOAuthAccessToken(pin, callback) {
    if (!this.consumerKey || !this.consumerSecret) {
      throw new Error("ConsumerKey and secret must be configured.");
    }
    this.client.getOAuthAccessToken(this.token, this.secret, pin, callback);
  }

  /**
   * Set accessToken.
   *
   * @param {string} token
   */
  setAccessToken(token) {
    this.token = token;
  }

  /**
   * Set accessTokenSecret.
   *
   * @param {string} secret
   */
  setAccessTokenSecret(secret) {
    this.secret = secret;
  }

  /**
   * Get credentials.
   *
   * @param {function} callback
   */
  verify(callback) {
    var url = "https://api.zaim.net/v2/home/user/verify";
    this._httpGet(url, {}, callback);
  }

  /**
   * Create payment.
   *
   * @param {object} params
   * @param {Function} callback
   */
  createPay(params, callback) {
    var url = "https://api.zaim.net/v2/home/money/payment";
    params.date = params.date || this._getCurrentDate();
    if (!params.category_id || !params.genre_id || !params.amount) {
      throw new Error(
        "Invalid parameters.category_id, genre_id and amount are necessary."
      );
    }
    if (!params.mapping) {
      params.mapping = 1;
    }
    this._httpPost(url, params, callback);
  }

  /**
   * Create income.
   *
   * @param {object} params
   * @param {Function} callback
   */
  createIncome(params, callback) {
    var url = "https://api.zaim.net/v2/home/money/income";
    params.date = params.date || this._getCurrentDate();
    if (!params.category_id || !params.amount) {
      throw new Error(
        "Invalid parameters.category_id and amount are necessary."
      );
    }
    if (!params.mapping) {
      params.mapping = 1;
    }
    this._httpPost(url, params, callback);
  }
  /**
   * Create transfer.
   *
   * @param {object} params
   * @param {Function} callback
   */
  createTransfer(params, callback) {
    var url = "https://api.zaim.net/v2/home/money/transfer";
    params.date = params.date || this._getCurrentDate();
    if (!params.from_account_id || !params.to_account_id || !params.amount) {
      throw new Error(
        "Invalid parameters.from_account_id, to_account_id, and amount are necessary."
      );
    }
    if (!params.mapping) {
      params.mapping = 1;
    }
    this._httpPost(url, params, callback);
  }

  /**
   * Update money data.
   *
   * @param {"payment" | "income" | "transfer"} itemType
   * @param {string} itemId
   * @param {object} params
   * @param {Function} callback
   */
  updateMoney(itemType, itemId, params, callback) {
    if (
      !(
        itemType === "payment" ||
        itemType === "income" ||
        itemType === "transfer"
      )
    ) {
      throw new Error("Invalid itemType: " + itemType);
    }
    var url = `https://api.zaim.net/v2/home/money/${itemType}/${itemId}`;
    params.date = params.date || this._getCurrentDate();
    if (!params.amount) {
      throw new Error(
        "Invalid parameters.category_id and amount are necessary."
      );
    }
    if (!params.mapping) {
      params.mapping = 1;
    }
    this._httpPut(url, params, callback);
  }

  /**
   * Delete money data.
   *
   * @param {"payment" | "income" | "transfer"} itemType
   * @param {string} itemId
   * @param {Function} callback
   */
  deleteMoney(itemType, itemId, callback) {
    if (
      !(
        itemType === "payment" ||
        itemType === "income" ||
        itemType === "transfer"
      )
    ) {
      throw new Error("Invalid itemType: " + itemType);
    }
    var url = `https://api.zaim.net/v2/home/money/${itemType}/${itemId}`;
    this._httpDelete(url, callback);
  }

  /**
   * Get money.
   *
   * @param {object} params
   * @param {Function} callback
   */
  getMoney(params, callback) {
    var url = "https://api.zaim.net/v2/home/money";
    if (arguments.length === 1) {
      callback = params;
      params = {};
    }
    if (!params.mapping) {
      params.mapping = 1;
    }
    this._httpGet(url, params, callback);
  }

  /**
   * Get payment categories.
   *
   * @param {object} params
   * @param {Function} callback
   */
  getCategories(params, callback) {
    var url = "https://api.zaim.net/v2/home/category";
    if (arguments.length === 1) {
      callback = params;
      params = {};
    }
    if (!params.mapping) {
      params.mapping = 1;
    }
    this._httpGet(url, params, callback);
  }

  /**
   * Get currencies.
   *
   * @param {function} callback
   */
  getCurrencies(callback) {
    var url = "https://api.zaim.net/v2/currency";
    this._httpGet(url, {}, callback);
  }

  /**
   * Execute http get.
   *
   * @api private
   * @param {string} url
   * @param {Function} callback
   */
  _httpGet(url, params, callback) {
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
  }

  /**
   * Execute http post.
   *
   * @api private
   * @param {string} url
   * @param {object} params
   * @param {Function} callback
   */
  _httpPost(url, params, callback) {
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
  }
  /**
   * Execute http put.
   *
   * @api private
   * @param {string} url
   * @param {object} params
   * @param {Function} callback
   */
  _httpPut(url, params, callback) {
    if (!this.token || !this.secret) {
      throw new Error("accessToken and tokenSecret must be configured.");
    }
    this.client.put(url, this.token, this.secret, params, function(err, data) {
      if (err) {
        throw err;
      } else {
        callback(typeof data === "string" ? JSON.parse(data) : data);
      }
    });
  }
  /**
   * Execute http delete.
   *
   * @api private
   * @param {string} url
   * @param {Function} callback
   */
  _httpDelete(url, callback) {
    if (!this.token || !this.secret) {
      throw new Error("accessToken and tokenSecret must be configured.");
    }
    this.client.delete(url, this.token, this.secret, function(err, data) {
      if (err) {
        throw err;
      } else {
        callback(typeof data === "string" ? JSON.parse(data) : data);
      }
    });
  }

  /**
   * Get current date.
   *
   * @api private
   * @return {string} ex) 2013-4-9
   */
  _getCurrentDate() {
    var date = new Date();
    return (
      date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
    );
  }
}
