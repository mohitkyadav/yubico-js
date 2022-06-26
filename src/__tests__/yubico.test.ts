require('dotenv').config();

import { Yubico, YubicoResponse, yubicoResErrorMessages, YubicoResponseStatus } from '..';

describe('Verify YubiKey OTP', () => {
  test('Invalid OTP format', async () => {
    const instance = new Yubico({
      clientId: process.env.CLIENT_ID,
      secretKey: process.env.SECRET_KEY,
    });

    try {
      const _res: YubicoResponse = await instance.verifyOtp('not_a_valid_otp');
    } catch (e) {
      const usedError = Error(yubicoResErrorMessages[YubicoResponseStatus.BAD_OTP]);
      expect(e).toStrictEqual(usedError);
    }
  });

  test('Verify Used OTP', async () => {
    const instance = new Yubico({
      clientId: process.env.CLIENT_ID,
      secretKey: process.env.SECRET_KEY,
    });

    const otp = process.env.OTP ?? '';
    try {
      const _res: YubicoResponse = await instance.verifyOtp(otp);
    } catch (e) {
      const usedError = Error(yubicoResErrorMessages[YubicoResponseStatus.REPLAYED_OTP]);
      expect(e).toStrictEqual(usedError);
    }
  });

  // test('Verify Correct OTP', async () => {
  //   const instance = new Yubico({
  //     clientId: process.env.CLIENT_ID,
  //     secretKey: process.env.SECRET_KEY,
  //   });

  //   const res: YubicoResponse = await instance.verifyOtp('touch_your_key');
  //   expect(res.status).toStrictEqual(YubicoResponseStatus.OK);
  // });
});
