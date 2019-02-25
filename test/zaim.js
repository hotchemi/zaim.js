var dir = process.env.ZAIM_COVERAGE ? "../lib-cov/" : "../lib/",
  Zaim = require(dir + "zaim").default,
  expect = require("expect.js");

describe("Constructor suite", function() {
  it("should throw a error without consumer key and secret", function() {
    expect(function() {
      new Zaim({});
    }).to.throwError(function(e) {
      expect(e.message).to.equal("ConsumerKey and secret must be configured.");
    });
  });

  it("should throw a error without consumer secret", function() {
    expect(function() {
      new Zaim({
        consumerKey: "consumerKey"
      });
    }).to.throwError();
  });

  it("should throw a error without consumer key", function() {
    expect(function() {
      new Zaim({
        consumerSecret: "consumerSecret"
      });
    }).to.throwError();
  });

  it("should not throw a error with valid params", function() {
    expect(function() {
      new Zaim({
        consumerKey: "consumerKey",
        consumerSecret: "consumerSecret"
      });
    }).to.not.throwError();
  });
});

describe("getAuthorizationUrl() suite", function() {
  it("should throw error without callback", function() {
    var zaim = new Zaim({
      consumerKey: "consumerKey",
      consumerSecret: "consumerSecret"
    });
    expect(function() {
      zaim.getAuthorizationUrl();
    }).to.throwError(function(e) {
      expect(e.message).to.equal(
        "ConsumerKey, secret and callback url must be configured."
      );
    });
  });

  it("should not throw error with valid parameters", function() {
    var zaim = new Zaim({
      consumerKey: "consumerKey",
      consumerSecret: "consumerSecret",
      callback: "http://zaim.net"
    });
    expect(function() {
      zaim.getAuthorizationUrl();
    }).to.not.throwError();
  });

  it("should match expected RegExp", function() {
    var zaim = new Zaim({
      consumerKey: "consumerKey",
      consumerSecret: "consumerSecret",
      callback: "http://zaim.net"
    });

    zaim.getAuthorizationUrl(function(url) {
      expect(url).to.match(
        /^https:\/\/www.zaim.net\/users\/auth\?oauth_token=/
      );
    });
  });
});

describe("setter suite", function() {
  it("should equal accessToken", function() {
    var zaim = new Zaim({
      consumerKey: "consumerKey",
      consumerSecret: "consumerSecret"
    });
    zaim.setAccessToken("accessToken");
    expect(zaim.token).to.equal("accessToken");
  });

  it("should equal accessTokenSecret", function() {
    var zaim = new Zaim({
      consumerKey: "consumerKey",
      consumerSecret: "consumerSecret"
    });
    zaim.setAccessTokenSecret("accessTokenSecret");
    expect(zaim.secret).to.equal("accessTokenSecret");
  });
});

describe("createPay suite", function() {
  it("should throw error with empty params", function() {
    var zaim = new Zaim({
      consumerKey: "consumerKey",
      consumerSecret: "consumerSecret"
    });
    expect(function() {
      zaim.createPay({}, function(data) {});
    }).to.throwError(function(e) {
      expect(e.message).to.equal(
        "Invalid parameters.category_id, genre_id and amount are necessary."
      );
    });
  });

  it("with valid parameters", function() {
    var zaim = new Zaim({
      consumerKey: "consumerKey",
      consumerSecret: "consumerSecret"
    });
    // throw error because set invalid consumer key and secret.
    expect(function() {
      zaim.createPay(
        {
          category_id: "category_id",
          genre_id: "genre_id",
          amount: 100,
          date: "2013-04-10"
        },
        function(data, error) {}
      );
    }).to.throwError(function(e) {
      expect(e.message).to.not.equal(
        "Invalid parameters.category_id, genre_id and amount are necessary."
      );
    });
  });
});

describe("createIncome suite", function() {
  it("should throw error with empty params", function() {
    var zaim = new Zaim({
      consumerKey: "consumerKey",
      consumerSecret: "consumerSecret"
    });
    expect(function() {
      zaim.createIncome({}, function(data) {});
    }).to.throwError(function(e) {
      expect(e.message).to.equal(
        "Invalid parameters.category_id and amount are necessary."
      );
    });
  });

  it("with valid parameters", function() {
    var zaim = new Zaim({
      consumerKey: "consumerKey",
      consumerSecret: "consumerSecret"
    });
    expect(function() {
      zaim.createIncome(
        {
          category_id: "category_id",
          amount: 100,
          date: "2013-04-10"
        },
        function(data, error) {}
      );
    }).to.throwError(function(e) {
      expect(e.message).to.not.equal(
        "Invalid parameters.category_id and amount are necessary."
      );
    });
  });
});

describe("private method suite", function() {
  it("should throw error without access token and secret", function() {
    var zaim = new Zaim({
      consumerKey: "consumerKey",
      consumerSecret: "consumerSecret"
    });
    expect(function() {
      zaim._httpGet("http://zaim.net", function(data) {});
    }).to.throwError(function(e) {
      expect(e.message).to.equal(
        "accessToken and tokenSecret must be configured."
      );
    });
  });

  it("should throw error without access token secret", function() {
    var zaim = new Zaim({
      consumerKey: "consumerKey",
      consumerSecret: "consumerSecret",
      accessToken: "accessToken"
    });
    expect(function() {
      zaim._httpGet("http://zaim.net/", function(data) {});
    }).to.throwError(function(e) {
      expect(e.message).to.equal(
        "accessToken and tokenSecret must be configured."
      );
    });
  });

  it("should throw error without access token", function() {
    var zaim = new Zaim({
      consumerKey: "consumerKey",
      consumerSecret: "consumerSecret",
      accessTokenSecret: "accessTokenSecret"
    });
    expect(function() {
      zaim._httpPost("http://zaim.net/", {}, function(data) {});
    }).to.throwError(function(e) {
      expect(e.message).to.equal(
        "accessToken and tokenSecret must be configured."
      );
    });
  });

  it("should not throw error with access token and secret", function() {
    var zaim = new Zaim({
      consumerKey: "consumerKey",
      consumerSecret: "consumerSecret",
      accessToken: "accessToken",
      accessTokenSecret: "accessTokenSecret"
    });
    expect(function() {
      zaim._httpPost("http://zaim.net/", {}, function(data) {});
    }).to.not.throwError();
  });

  it("should return valid date today", function() {
    var zaim = new Zaim({
        consumerKey: "consumerKey",
        consumerSecret: "consumerSecret",
        accessToken: "accessToken",
        accessTokenSecret: "accessTokenSecret"
      }),
      ymd = new Date(),
      yy = (ymd.getYear() % 1900) + 1900,
      mm = ymd.getMonth() + 1,
      dd = ymd.getDate();
    expect(zaim._getCurrentDate()).to.equal(yy + "-" + mm + "-" + dd);
  });
});
