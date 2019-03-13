/**
 * Module dependencies.
 */
const oauth: any = require("oauth");
import { promisify } from "util";
import {
  clientGetOAuthRequestTokenOverride,
  clientGetOAuthAccessTokenOverride
} from "./promisify-override";

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

    this.client.getOAuthRequestToken[
      promisify.custom
    ] = clientGetOAuthRequestTokenOverride;
    this.client.getOAuthAccessToken[
      promisify.custom
    ] = clientGetOAuthAccessTokenOverride;
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
   * Get authorization url.
   */
  async getAuthorizationUrlAsync(): Promise<string> {
    if (!this.consumerKey || !this.consumerSecret) {
      throw new Error("ConsumerKey and secret must be configured.");
    }
    const { token, secret } = await promisify(
      this.client.getOAuthRequestToken
    ).bind(this.client)();
    this.token = token;
    this.secret = secret;
    return "https://auth.zaim.net/users/auth?oauth_token=" + this.token;
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
   * Get oauth access token.
   *
   * @param {string} pin
   */
  async getOAuthAccessTokenAsync(pin: string) {
    if (!this.consumerKey || !this.consumerSecret) {
      throw new Error("ConsumerKey and secret must be configured.");
    }
    return await promisify(this.client.getOAuthAccessToken).bind(this.client)(
      this.token,
      this.secret,
      pin
    );
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
  verify(callback?: RequestCallbackFunction) {
    var url = "https://api.zaim.net/v2/home/user/verify";
    if (callback) this._httpGet(url, {}, callback);
    else return this._httpGetAsync(url, {});
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
    callback?: RequestCallbackFunction
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
    if (callback) this._httpPost(url, params, callback);
    else return this._httpPostAsync(url, params);
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
    callback?: RequestCallbackFunction
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
    if (callback) this._httpPost(url, params, callback);
    else return this._httpPostAsync(url, params);
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
    callback?: RequestCallbackFunction
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
    if (callback) this._httpPost(url, params, callback);
    else return this._httpPostAsync(url, params);
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
    callback?: RequestCallbackFunction
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
    if (callback) this._httpPut(url, params, callback);
    else return this._httpPutAsync(url, params);
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
    callback?: RequestCallbackFunction
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
    if (callback) this._httpDelete(url, callback);
    else return this._httpDeleteAsync(url);
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
    callback?: RequestCallbackFunction
  ) {
    var url = "https://api.zaim.net/v2/home/money";
    if (!params.mapping) {
      params.mapping = 1;
    }
    if (callback) this._httpGet(url, params, callback);
    else return this._httpGetAsync(url, params);
  }

  /**
   * Get payment categories.
   *
   * @param {object} params
   * @param {Function} callback
   */
  getCategories(callback?: RequestCallbackFunction) {
    var url = "https://api.zaim.net/v2/home/category";
    if (callback) this._httpGet(url, { mapping: 1 }, callback);
    else return this._httpGetAsync(url, { mapping: 1 });
  }

  /**
   * Get payment genre.
   *
   * @param {object} params
   * @param {Function} callback
   */
  getGenre(callback?: RequestCallbackFunction) {
    var url = "https://api.zaim.net/v2/home/genre";
    if (callback) this._httpGet(url, { mapping: 1 }, callback);
    else return this._httpGetAsync(url, { mapping: 1 });
  }

  /**
   * Get accounts.
   *
   * @param {object} params
   * @param {Function} callback
   */
  getAccounts(callback?: RequestCallbackFunction) {
    var url = "https://api.zaim.net/v2/home/account";
    if (callback) this._httpGet(url, { mapping: 1 }, callback);
    else return this._httpGetAsync(url, { mapping: 1 });
  }

  /**
   * Get currencies.
   *
   * @param {function} callback
   */
  getCurrencies(callback?: RequestCallbackFunction) {
    var url = "https://api.zaim.net/v2/currency";
    if (callback) this._httpGet(url, {}, callback);
    else return this._httpGetAsync(url, {});
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

  // Promisified

  /**
   * Execute http get.
   *
   * @api private
   * @param {string} url
   * @param {Function} callback
   */
  async _httpGetAsync(url: string, params: any): Promise<any> {
    if (!this.token || !this.secret) {
      throw new Error("accessToken and tokenSecret must be configured.");
    }
    url += "?";
    Object.keys(params).forEach(function(key) {
      url += key + "=" + params[key] + "&";
    });
    url.slice(0, -1);
    const clientGetAsync = promisify(this.client.get).bind(this.client);
    return await clientGetAsync(url, this.token, this.secret);
  }

  /**
   * Execute http post.
   *
   * @api private
   * @param {string} url
   * @param {object} params
   * @param {Function} callback
   */
  async _httpPostAsync(url: string, params: any): Promise<any> {
    if (!this.token || !this.secret) {
      throw new Error("accessToken and tokenSecret must be configured.");
    }
    const clientPostAsync = promisify(this.client.post).bind(this.client);
    return await clientPostAsync(url, this.token, this.secret, params);
  }
  /**
   * Execute http put.
   *
   * @api private
   * @param {string} url
   * @param {object} params
   * @param {Function} callback
   */
  async _httpPutAsync(url: string, params: any): Promise<any> {
    if (!this.token || !this.secret) {
      throw new Error("accessToken and tokenSecret must be configured.");
    }
    const clientPutAsync = promisify(this.client.put).bind(this.client);
    return await clientPutAsync(url, this.token, this.secret, params);
  }
  /**
   * Execute http delete.
   *
   * @api private
   * @param {string} url
   * @param {Function} callback
   */
  async _httpDeleteAsync(url: string): Promise<any> {
    if (!this.token || !this.secret) {
      throw new Error("accessToken and tokenSecret must be configured.");
    }
    const clientDeleteAsync = promisify(this.client.delete).bind(this.client);
    return await clientDeleteAsync(url, this.token, this.secret);
  }
}
