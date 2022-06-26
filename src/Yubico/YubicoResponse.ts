import * as crypto from 'crypto';
import { yubicoResErrorMessages, keysUsedInHash, modHexMap } from '../constants';

import { YubicoResponseStatus } from '../enums';
import { IYubicoResponse } from '../interfaces';
import { SL } from '../types';

export class YubicoResponse {
  public otp: string;
  public nonce: string;
  public h: string;
  public t: number;
  public status: YubicoResponseStatus;
  public timestamp: string;
  public sessioncounter: string;
  public sessionuse: string;
  public sl: SL;

  constructor(options: IYubicoResponse) {
    this.otp = options.otp;
    this.nonce = options.nonce;
    this.h = options.h;
    this.t = options.t;
    this.status = options.status;
    this.timestamp = options.timestamp;
    this.sessioncounter = options.sessioncounter;
    this.sessionuse = options.sessionuse;
    this.sl = options.sl;
  }

  /**
   * @returns {string} The public get ID is the first 12 bytes of the OTP.
   */
  public getPublicId(): string {
    return this.otp.substring(0, 12);
  }

  /**
   * @returns {number} The serial number of the key.
   */
  public getKeySerialNumber(): number {
    const publicId = this.getPublicId();

    // Do the conversion and return the 48 bit integer
    return Buffer.from(
      publicId
        .split('')
        .map((char) => modHexMap[char as keyof typeof modHexMap])
        .join(''),
      'hex',
    ).readUIntBE(0, 6);
  }

  /**
   * Creates a response from a string body
   * @param body {string} Response body as string from the API server
   * @returns {YubicoResponse} Newly generated Response instance from the input
   */
  public static fromRawString(body: string): YubicoResponse {
    // Sanitize the input
    const listAttr: string[] = body.replace(/\r\n/g, '\n').split('\n').slice(0, -2);

    const options: object = listAttr.reduce((obj, resItem) => {
      // resItem = 'key=value'
      const separator = '=';
      const [key, ...value] = resItem.split(separator);

      return Object.assign(obj, {
        [key]: value.join(separator),
      });
    }, {});

    return new YubicoResponse(options as IYubicoResponse);
  }

  /**
   * Validate the request with nonce, secret, and otp.
   * @param nonce {string} Nonce used during the request
   * @param secret {string} Secret used to verify against
   * @param otp {string} OTP
   */
  public validate(nonce: string, secret: string, otp: string) {
    if (this.status !== YubicoResponseStatus.OK) {
      const errorMessage: string = yubicoResErrorMessages[this.status];

      if (!errorMessage) {
        throw new Error('Unknown response status: ' + this.status);
      }

      throw new Error(errorMessage);
    }

    if (this.nonce !== nonce) {
      throw new Error('Nonces do not match.');
    }

    const body = keysUsedInHash
      .sort()
      .map((key) => key + '=' + (this as any)[key])
      .join('&');

    const hash = crypto.createHmac('sha1', Buffer.from(secret, 'base64')).update(body).digest('base64');

    if (hash !== this.h) {
      throw new Error('Hash provided from server and client hash do not match');
    }

    if (this.otp !== otp) {
      throw new Error('OTPs do not match');
    }
  }
}
