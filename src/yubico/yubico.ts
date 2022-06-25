import * as crypto from 'crypto';
import * as https from 'https';

import { IYubico } from '../interfaces';
import { SL } from '../types';
import { SERVERS } from '../constants';

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

  constructor(options?: IYubico) {
    if (options) {
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
  }

  /**
   * Verify key against Yubico servers
   * More info on OTPs https://developers.yubico.com/OTP/OTPs_Explained.html
   * @param otp {string} The OTP from the YubiKey.
   * @returns {Promise<Response>}
   */
  public async verifyOtp(otp: string): Promise<Response> {
    // The length of the key = [16, 40]
    const nonce: string = crypto.randomBytes(16).toString('hex');

    const requestParams: URLSearchParams = new URLSearchParams();

    requestParams.append('id', this.clientId);
    requestParams.append('nonce', nonce);
    requestParams.append('otp', otp);

    if (this.sl) {
      requestParams.append('sl', this.sl as string);
    }

    if (this.timeout) {
      requestParams.append('timeout', this.timeout.toString());
    }

    requestParams.append('timestamp', '1');

    // Sort them to properly allow for the security hash
    // requestParams.sort();

    const hash = crypto
      .createHmac('sha1', Buffer.from(this.secretKey, 'base64'))
      .update(requestParams.toString())
      .digest('base64');

    requestParams.append('h', hash);

    console.log(requestParams.toString());
  }
}
