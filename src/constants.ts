import { YubicoResponseStatus } from './enums';

export const SERVERS: string[] = [
  'api.yubico.com',
  'api2.yubico.com',
  'api3.yubico.com',
  'api4.yubico.com',
  'api5.yubico.com',
];

/**
 * Error messages
 * Source: https://developers.yubico.com/yubikey-val/Validation_Protocol_V2.0.html
 */
export const errorMessages = {
  [YubicoResponseStatus.BAD_OTP]: 'The OTP is invalid format',
  [YubicoResponseStatus.REPLAYED_OTP]: 'The OTP has already been seen by the service.',
  [YubicoResponseStatus.BAD_SIGNATURE]: 'The HMAC signature verification failed.',
  [YubicoResponseStatus.MISSING_PARAMETER]: 'The request lacks a parameter.',
  [YubicoResponseStatus.NO_SUCH_CLIENT]:
    'The client id does not exist. If you just registered for one, please give it 10 minutes to propagate',
  [YubicoResponseStatus.OPERATION_NOT_ALLOWED]: 'The client id is not allowed to verify OTPs.',
  [YubicoResponseStatus.BACKEND_ERROR]: 'Unexpected error in our server. Please contact Yubico if you see this error.',
  [YubicoResponseStatus.NOT_ENOUGH_ANSWERS]: 'Server could not get requested number of syncs during before timeout.',
  [YubicoResponseStatus.REPLAYED_REQUEST]: 'Server has seen the OTP/Nonce combination before',
};
