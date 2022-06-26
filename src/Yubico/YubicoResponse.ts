import * as crypto from 'crypto';
import { yubicoResErrorMessages, keysUsedInHash, modHexMap } from '../constants';

import { YubicoResponseStatus } from '../enums';
import { IYubicoResponse } from '../interfaces';
import { SL } from '../types';

export class YubicoResponse {
  private _otp: string;
  private _nonce: string;
  private _h: string;
  private _t: number;
  private _status: YubicoResponseStatus;
  private _timestamp: string;
  private _sessioncounter: string;
  private _sessionuse: string;
  private _sl: SL;

  constructor(options: IYubicoResponse) {
    this._otp = options.otp;
    this._nonce = options.nonce;
    this._h = options.h;
    this._t = options.t;
    this._status = options.status;
    this._timestamp = options.timestamp;
    this._sessioncounter = options.sessioncounter;
    this._sessionuse = options.sessionuse;
    this._sl = options.sl;
  }

  public get otp(): string {
    return this._otp;
  }

  /**
   * @returns {Date} UTC time of request
   */
  public get t(): Date {
    return new Date(this._t * 1000);
  }

  /**
   * @returns {Date} Time when the YubiKey was pressed.
   */
  public get timestamp(): Date {
    return new Date(this._timestamp);
  }

  /**
   * @returns {number} YubiKey usage counter.
   */
  public get sessioncounter(): number {
    return parseInt(this._sessioncounter, 10);
  }

  /**
   * @returns {number} YubiKey internal session usage counter when key was pressed
   */
  public get sessionuse(): number {
    return parseInt(this._sessionuse, 10);
  }

  /**
   * @returns {SL} Server sync percentage.
   */
  public get sl(): SL {
    return this._sl;
  }

  /**
   * @returns {ResponseStatus} The status of the request.
   */
  public get status(): YubicoResponseStatus {
    return this._status;
  }

  /**
   * @returns {string} The public get ID is the first 12 bytes of the OTP.
   */
  public getPublicId(): string {
    return this._otp.substring(0, 12);
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
      const [key, value] = resItem.split('=');

      return Object.assign(obj, {
        [key]: value,
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
    if (this._status !== YubicoResponseStatus.OK) {
      const errorMessage: string = yubicoResErrorMessages[this._status];

      if (!errorMessage) {
        throw new Error('Unknown response status: ' + this._status);
      }

      throw new Error(errorMessage);
    }

    if (this._nonce !== nonce) {
      throw new Error('Nonces do not match.');
    }

    const body = keysUsedInHash
      .filter((key) => (this as any)[key] !== undefined)
      .sort()
      .map((key) => key + '=' + (this as any)[key])
      .join('&');

    const hash = crypto.createHmac('sha1', Buffer.from(secret, 'base64')).update(body).digest('base64');

    if (hash !== this._h) {
      throw new Error('Hash provided from server and client hash do not match');
    }

    if (this._otp !== otp) {
      throw new Error('OTPs do not match');
    }
  }
}
