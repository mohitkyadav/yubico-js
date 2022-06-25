require('dotenv').config();

import { Yubico } from '..';

test('Verify OTP', () => {
  console.log(process.env);

  const instance = new Yubico({
    clientId: process.env.CLIENT_ID,
    secretKey: process.env.SECRET_KEY,
  });

  const otp = process.env.OTP ?? '';

  expect(instance.verifyOtp(otp)).toBe(false);
});
