import * as crypto from 'crypto';
import * as https from 'https';

import { IYubico } from '../interfaces';
import { SL } from '../types';
import { SERVERS } from '../constants';
import { YubicoResponse } from './YubicoResponse';
import { YubicoResponseStatus } from '../enums';

/**
 * Yubico client
 */
export class Yubico {
  /**
   * clientId is retrieved from https://upgrade.yubico.com/getapikey
   */
  private clientId: string;

  /**
   * secretKey is retrieved from https://upgrade.yubico.com/getapikey
   */
  private secretKey: string;

  /**
   * A value 0 to 100 indicating percentage of syncing required by client,
   * or strings "fast" or "secure" to use server-configured values;
   * if absent, let the server decide
   */
  private sl?: SL;

  /**
   * Number of seconds to wait for sync responses; if absent, let the server decide.
   */
  private timeout?: number;

  /**
   * API servers used for verification, leave blank to use Yubico verification servers.
   */
  private apiServers: string[] = SERVERS;

  constructor(options: IYubico) {
    if (options.clientId) {
      this.clientId = options.clientId;
    } else {
      throw new Error('clientId is required.');
    }

    if (options.secretKey) {
      this.secretKey = options.secretKey;
    } else {
      throw new Error('secretKey is required.');
    }

    if (options.sl) {
      this.sl = options.sl;
    }

    if (options.timeout) {
      this.timeout = options.timeout;
    }

    if (options.apiServers) {
      this.apiServers = options.apiServers;
    }
  }

  /**
   * Verify key against Yubico servers
   * More info on OTPs https://developers.yubico.com/OTP/OTPs_Explained.html
   * @param otp {string} The OTP from the YubiKey.
   * @returns {Promise<YubicoResponse>}
   */
  public async verifyOtp(otp: string): Promise<YubicoResponse> {
    // The length of the key = [16, 40]
    const nonce: string = crypto.randomBytes(16).toString('hex');

    const params: URLSearchParams = new URLSearchParams();

    // <-- Keep the same order: The order of params is important for generating the hash
    params.append('id', this.clientId);
    params.append('nonce', nonce);
    params.append('otp', otp);

    if (this.sl) {
      params.append('sl', this.sl as string);
    }

    if (this.timeout) {
      params.append('timeout', this.timeout.toString());
    }

    params.append('timestamp', '1');
    // Keep the same order -->

    const hash = crypto
      .createHmac('sha1', Buffer.from(this.secretKey, 'base64'))
      .update(params.toString())
      .digest('base64');

    params.append('h', hash);

    const failedRes: YubicoResponse[] = [];
    const cancelReqCallbacks: Array<() => void> = [];

    const requestPromises = this.apiServers.map(
      (apiServer) =>
        new Promise<YubicoResponse | undefined>((resolve) => {
          const url = new URL('https://' + apiServer + '/wsapi/2.0/verify');

          url.search = params.toString();

          const req = https.get(url.href, (res) => {
            res.setEncoding('utf8');

            let incomingData = '';
            // Listen on response and collect the chunks of data.
            res.on('data', (chunk) => {
              incomingData += chunk;
            });

            // On response end, resolve with the data if successful
            res.on('end', () => {
              if (res.statusCode !== 200) {
                resolve(undefined);
              } else {
                resolve(YubicoResponse.fromRawString(incomingData));
              }
            });
            res.on('error', () => resolve(undefined));
          });

          cancelReqCallbacks.push(() => {
            req.destroy();
            resolve(undefined);
          });

          req.on('error', () => resolve(undefined));
          req.end();
        }),
    );

    for await (const res of requestPromises) {
      // When request cancelled or network failed res is undefined.
      // Continue to the next one.
      if (!res) {
        continue;
      }

      // On first successful response
      if (res.status === YubicoResponseStatus.OK) {
        // Validate the response by matching server and client hash.
        res.validate(nonce, this.secretKey, otp);
        // Cancel upcoming requests if validation successful.
        cancelReqCallbacks.map((cb) => cb());

        return res;
      } else {
        failedRes.push(res);
      }
    }
    // If there were no failed responses (or successes as they would return)
    // throw a network error.
    if (failedRes.length === 0) {
      throw new Error('Yubico API server network error');
    }

    // If there were all failed responses, throw the first one.
    failedRes[0].validate(nonce, this.secretKey, otp);
    return failedRes[0];
  }
}
