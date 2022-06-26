import { YubicoResponseStatus } from '../enums';
import { IResponse } from '../interfaces';

export class YubicoResponse {
  private _otp: string;
  private _nonce: string;
  private _h: string;
  private _t: number;
  private _status: YubicoResponseStatus;
  private _timestamp: string;
  private _sessioncounter: string;
  private _sessionuse: string;
  private _sl: number;

  constructor(options: IResponse) {
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
   * @returns {ResponseStatus} The status of the request.
   */
  public get status(): YubicoResponseStatus {
    return this._status;
  }
}
