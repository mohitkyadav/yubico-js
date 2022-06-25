require('dotenv').config();

import { Yubico, errorMessages, YubicoResponseStatus } from '..';

describe('Verify YubiKey OTP', () => {
  test('Verify Used OTP', async () => {
    const instance = new Yubico({
      clientId: process.env.CLIENT_ID,
      secretKey: process.env.SECRET_KEY,
    });

    const otp = process.env.OTP ?? '';
    try {
      const _res = await instance.verifyOtp(otp);
    } catch (e) {
      const usedError = Error(errorMessages[YubicoResponseStatus.REPLAYED_OTP]);
      expect(e).toStrictEqual(usedError);
    }
  });
});
