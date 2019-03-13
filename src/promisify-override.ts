import { promisify } from "util";

export function clientGetOAuthRequestTokenOverride(this: any) {
  return new Promise((resolve, reject) => {
    this.getOAuthRequestToken(
      (err: any, token: string, secret: string, results: any) => {
        if (err) {
          reject(err);
          return;
        }
        resolve({
          token,
          secret,
          results
        });
      }
    );
  });
}

export function clientGetOAuthAccessTokenOverride(
  this: any,
  oauth_token: string,
  oauth_token_secret: string,
  oauth_verifier: string
) {
  return new Promise((resolve, reject) => {
    this.getOAuthAccessToken(
      oauth_token,
      oauth_token_secret,
      oauth_verifier,
      (err: any, token: string, secret: string, results: any) => {
        if (err) {
          reject(err);
          return;
        }
        resolve({
          token,
          secret,
          results
        });
      }
    );
  });
}
