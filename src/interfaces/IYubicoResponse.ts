import { YubicoResponseStatus } from '../enums';

export interface IYubicoResponse {
  otp: string;
  nonce: string;
  h: string;
  t: number;
  status: YubicoResponseStatus;
  timestamp: string;
  sessioncounter: string;
  sessionuse: string;
  sl: number;
}
