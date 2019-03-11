/**
 * Module dependencies.
 */
const oauth: any = require("oauth");
type ErrorObject = { statusCode: number; data: any };
type RequestCallbackFunction = (data: any) => void;
type AuthParams = {
  consumerKey: string;
  consumerSecret: string;
  accessToken?: string;
  accessTokenSecret?: string;
  callback?: string;
};
type ItemType = "payment" | "income" | "transfer";
/**
 * Constructor.
 *
 * @param {object} params
 */
export default class Zaim {
  consumerKey: string;
  consumerSecret: string;
  token!: string;
  secret!: string;
  client = oauth.OAuth;

  constructor(params: AuthParams) {
    if (!params.consumerKey || !params.consumerSecret) {
      throw new Error("ConsumerKey and secret must be configured.");
    }

    this.consumerKey = params.consumerKey;
    this.consumerSecret = params.consumerSecret;

    if (params.accessToken && params.accessTokenSecret) {
      this.token = params.accessToken;
      this.secret = params.accessTokenSecret;
    } else if (!params.callback) {
      throw new Error("Callback url must be configured.");
    }
    this.client = new oauth.OAuth(
      "https://api.zaim.net/v2/auth/request",
      "https://api.zaim.net/v2/auth/access",
      this.consumerKey,
      this.consumerSecret,
      "1.0",
      params.callback,
      "HMAC-SHA1"
    );
  }

  /**
   * Get authorization url.
   *
   * @param {Function} callback
   */
  getAuthorizationUrl(callback: (url: string) => void) {
    var that = this;
    if (!this.consumerKey || !this.consumerSecret) {
      throw new Error("ConsumerKey and secret must be configured.");
    }
    this.client.getOAuthRequestToken(function(
      err: ErrorObject,
      token: string,
      secret: string
    ) {
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
  getOAuthAccessToken(pin: string, callback: RequestCallbackFunction) {
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
  setAccessToken(token: string) {
    this.token = token;
  }

  /**
   * Set accessTokenSecret.
   *
   * @param {string} secret
   */
  setAccessTokenSecret(secret: string) {
    this.secret = secret;
  }

  /**
   * Get credentials.
   *
   * @param {function} callback
   */
  verify(callback: RequestCallbackFunction) {
    var url = "https://api.zaim.net/v2/home/user/verify";
    this._httpGet(url, {}, callback);
  }

  /**
   * Create payment.
   *
   * @param {object} params
   * @param {Function} callback
   */
  createPay(
    params: {
      mapping?: 1;
      category_id: number;
      genre_id: number;
      amount: number;
      date: Date;
      from_account_id?: number;
      comment?: string;
      name?: string;
      place?: string;
    },
    callback: RequestCallbackFunction
  ) {
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
  createIncome(
    params: {
      mapping?: 1;
      category_id: number;
      amount: number;
      date: Date;
      to_account_id?: number;
      place?: string;
      comment?: string;
    },
    callback: RequestCallbackFunction
  ) {
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
  createTransfer(
    params: {
      mapping?: 1;
      amount: number;
      date: Date;
      from_account_id: number;
      to_account_id: number;
      comment?: string;
    },
    callback: RequestCallbackFunction
  ) {
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
  updateMoney(
    itemType: ItemType,
    itemId: number,
    params: {
      mapping?: 1;
      amount: number;
      date: Date;
      from_account_id?: number;
      to_account_id?: number;
      genre_id?: number;
      category_id?: number;
      comment?: string;
    },
    callback: RequestCallbackFunction
  ) {
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
  deleteMoney(
    itemType: ItemType,
    itemId: number,
    callback: RequestCallbackFunction
  ) {
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
  getMoney(
    params: {
      mapping?: 1;
      category_id?: number;
      genre_id?: number;
      mode?: ItemType;
      order?: "id" | "date";
      start_date?: Date;
      end_date?: Date;
      page?: number;
      limit?: number;
      group_by?: "receipt_id";
    },
    callback: RequestCallbackFunction
  ) {
    var url = "https://api.zaim.net/v2/home/money";
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
  getCategories(callback: RequestCallbackFunction) {
    var url = "https://api.zaim.net/v2/home/category";
    this._httpGet(url, {}, callback);
  }

  /**
   * Get currencies.
   *
   * @param {function} callback
   */
  getCurrencies(callback: RequestCallbackFunction) {
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
  _httpGet(url: string, params: any, callback: RequestCallbackFunction) {
    if (!this.token || !this.secret) {
      throw new Error("accessToken and tokenSecret must be configured.");
    }
    url += "?";
    Object.keys(params).forEach(function(key) {
      url += key + "=" + params[key] + "&";
    });
    url.slice(0, -1);
    this.client.get(url, this.token, this.secret, function(
      err: any,
      data: any
    ) {
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
  _httpPost(url: string, params: any, callback: RequestCallbackFunction) {
    if (!this.token || !this.secret) {
      throw new Error("accessToken and tokenSecret must be configured.");
    }
    this.client.post(url, this.token, this.secret, params, function(
      err: any,
      data: any
    ) {
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
  _httpPut(url: string, params: any, callback: RequestCallbackFunction) {
    if (!this.token || !this.secret) {
      throw new Error("accessToken and tokenSecret must be configured.");
    }
    this.client.put(url, this.token, this.secret, params, function(
      err: any,
      data: any
    ) {
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
  _httpDelete(url: string, callback: RequestCallbackFunction) {
    if (!this.token || !this.secret) {
      throw new Error("accessToken and tokenSecret must be configured.");
    }
    this.client.delete(url, this.token, this.secret, function(
      err: any,
      data: any
    ) {
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
