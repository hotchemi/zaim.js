var dir = process.env.ZAIM_COVERAGE ? "../lib-cov/" : "../lib/",
  Zaim = require(dir + "zaim").default,
  expect = require("expect.js");

describe("Constructor suite", () => {
  it("should throw a error without consumer key and secret", () => {
    expect(() => {
      new Zaim({});
    }).to.throwError(e => {
      expect(e.message).to.equal("ConsumerKey and secret must be configured.");
    });
  });

  it("should throw a error without consumer secret", () => {
    expect(() => {
      new Zaim({
        consumerKey: "consumerKey",
        callback: "http://zaim.net"
      });
    }).to.throwError();
  });

  it("should throw a error without consumer key", () => {
    expect(() => {
      new Zaim({
        consumerSecret: "consumerSecret",
        callback: "http://zaim.net"
      });
    }).to.throwError();
  });

  it("should not throw a error with valid params", () => {
    expect(() => {
      new Zaim({
        consumerKey: "consumerKey",
        consumerSecret: "consumerSecret",
        callback: "http://zaim.net"
      });
    }).to.not.throwError();
  });

  it("should throw error without callback", () => {
    expect(() => {
      new Zaim({
        consumerKey: "consumerKey",
        consumerSecret: "consumerSecret"
      });
    }).to.throwError(e => {
      expect(e.message).to.equal("Callback url must be configured.");
    });
  });

  it("should throw error without callback when only accessToken is given", () => {
    expect(() => {
      new Zaim({
        consumerKey: "consumerKey",
        consumerSecret: "consumerSecret",
        accessToken: "accessToken"
      });
    }).to.throwError(e => {
      expect(e.message).to.equal("Callback url must be configured.");
    });
  });

  it("should throw error without callback when only accessTokenSecret is given", () => {
    expect(() => {
      new Zaim({
        consumerKey: "consumerKey",
        consumerSecret: "consumerSecret",
        accessTokenSecret: "accessTokenSecret"
      });
    }).to.throwError(e => {
      expect(e.message).to.equal("Callback url must be configured.");
    });
  });

  it("should not throw error even when callback is missing if accessToken and accessTokenSecret are given", () => {
    expect(() => {
      new Zaim({
        consumerKey: "consumerKey",
        consumerSecret: "consumerSecret",
        accessToken: "accessToken",
        accessTokenSecret: "accessTokenSecret"
      });
    }).to.not.throwError();
  });
});

describe("getAuthorizationUrl() suite", () => {
  it("should not throw error with valid parameters", () => {
    const zaim = new Zaim({
      consumerKey: "consumerKey",
      consumerSecret: "consumerSecret",
      callback: "http://zaim.net"
    });
    expect(() => {
      zaim.getAuthorizationUrl();
    }).to.not.throwError();
  });

  it("should match expected RegExp", () => {
    const zaim = new Zaim({
      consumerKey: "consumerKey",
      consumerSecret: "consumerSecret",
      callback: "http://zaim.net"
    });

    zaim.getAuthorizationUrl(url => {
      expect(url).to.match(
        /^https:\/\/www.zaim.net\/users\/auth\?oauth_token=/
      );
    });
  });
});

describe("setter suite", () => {
  it("should equal accessToken", () => {
    const zaim = new Zaim({
      consumerKey: "consumerKey",
      consumerSecret: "consumerSecret",
      callback: "http://zaim.net"
    });
    zaim.setAccessToken("accessToken");
    expect(zaim.token).to.equal("accessToken");
  });

  it("should equal accessTokenSecret", () => {
    const zaim = new Zaim({
      consumerKey: "consumerKey",
      consumerSecret: "consumerSecret",
      callback: "http://zaim.net"
    });
    zaim.setAccessTokenSecret("accessTokenSecret");
    expect(zaim.secret).to.equal("accessTokenSecret");
  });
});

describe("createPay suite", () => {
  it("should throw error with empty params", () => {
    const zaim = new Zaim({
      consumerKey: "consumerKey",
      consumerSecret: "consumerSecret",
      callback: "http://zaim.net"
    });
    expect(() => {
      zaim.createPay({}, data => {});
    }).to.throwError(e => {
      expect(e.message).to.equal(
        "Invalid parameters.category_id, genre_id and amount are necessary."
      );
    });
  });

  it("with valid parameters", () => {
    const zaim = new Zaim({
      consumerKey: "consumerKey",
      consumerSecret: "consumerSecret",
      callback: "http://zaim.net"
    });
    // throw error because set invalid consumer key and secret.
    expect(() => {
      zaim.createPay(
        {
          category_id: "category_id",
          genre_id: "genre_id",
          amount: 100,
          date: "2013-04-10"
        },
        (data, error) => {}
      );
    }).to.throwError(e => {
      expect(e.message).to.not.equal(
        "Invalid parameters.category_id, genre_id and amount are necessary."
      );
    });
  });
});

describe("createIncome suite", () => {
  it("should throw error with empty params", () => {
    const zaim = new Zaim({
      consumerKey: "consumerKey",
      consumerSecret: "consumerSecret",
      callback: "http://zaim.net"
    });
    expect(() => {
      zaim.createIncome({}, data => {});
    }).to.throwError(e => {
      expect(e.message).to.equal(
        "Invalid parameters.category_id and amount are necessary."
      );
    });
  });

  it("with valid parameters", () => {
    const zaim = new Zaim({
      consumerKey: "consumerKey",
      consumerSecret: "consumerSecret",
      callback: "http://zaim.net"
    });
    expect(() => {
      zaim.createIncome(
        {
          category_id: "category_id",
          amount: 100,
          date: "2013-04-10"
        },
        (data, error) => {}
      );
    }).to.throwError(e => {
      expect(e.message).to.not.equal(
        "Invalid parameters.category_id and amount are necessary."
      );
    });
  });
});

describe("private method suite", () => {
  it("should throw error without access token and secret", () => {
    const zaim = new Zaim({
      consumerKey: "consumerKey",
      consumerSecret: "consumerSecret",
      callback: "http://zaim.net"
    });
    expect(() => {
      zaim.httpGet("http://zaim.net", data => {});
    }).to.throwError(e => {
      expect(e.message).to.equal(
        "accessToken and tokenSecret must be configured."
      );
    });
  });

  it("should throw error without access token secret", () => {
    const zaim = new Zaim({
      consumerKey: "consumerKey",
      consumerSecret: "consumerSecret",
      accessToken: "accessToken",
      callback: "http://zaim.net"
    });
    expect(() => {
      zaim.httpGet("http://zaim.net/", data => {});
    }).to.throwError(e => {
      expect(e.message).to.equal(
        "accessToken and tokenSecret must be configured."
      );
    });
  });

  it("should throw error without access token", () => {
    const zaim = new Zaim({
      consumerKey: "consumerKey",
      consumerSecret: "consumerSecret",
      accessTokenSecret: "accessTokenSecret",
      callback: "http://zaim.net"
    });
    expect(() => {
      zaim.httpPost("http://zaim.net/", {}, data => {});
    }).to.throwError(e => {
      expect(e.message).to.equal(
        "accessToken and tokenSecret must be configured."
      );
    });
  });

  it("should not throw error with access token and secret", () => {
    const zaim = new Zaim({
      consumerKey: "consumerKey",
      consumerSecret: "consumerSecret",
      accessToken: "accessToken",
      accessTokenSecret: "accessTokenSecret"
    });
    expect(() => {
      zaim.httpPost("http://zaim.net/", {}, data => {});
    }).to.not.throwError();
  });

  it("should return valid date today", () => {
    const zaim = new Zaim({
        consumerKey: "consumerKey",
        consumerSecret: "consumerSecret",
        accessToken: "accessToken",
        accessTokenSecret: "accessTokenSecret"
      }),
      ymd = new Date(),
      yy = (ymd.getYear() % 1900) + 1900,
      mm = ymd.getMonth() + 1,
      dd = ymd.getDate();
    expect(zaim.getCurrentDate()).to.equal(yy + "-" + mm + "-" + dd);
  });
  it("should return valid formatted date", () => {
    const zaim = new Zaim({
      consumerKey: "consumerKey",
      consumerSecret: "consumerSecret",
      accessToken: "accessToken",
      accessTokenSecret: "accessTokenSecret"
    });
    expect(zaim.formatDate(new Date(2018, 10, 24))).to.equal("2018-11-24");
  });
  it("should throw an error with wrongly-formatted string", () => {
    const zaim = new Zaim({
      consumerKey: "consumerKey",
      consumerSecret: "consumerSecret",
      accessToken: "accessToken",
      accessTokenSecret: "accessTokenSecret"
    });
    expect(() => {
      zaim.formatDate("2018/11/24");
    }).to.throwError(e => {
      expect(e.message).to.equal(
        "Wrong date format. Correct format is `YYYY-mm-dd`. Consider using `Date`, which zaim.js automatically formats."
      );
    });
  });
});
