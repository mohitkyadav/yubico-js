import { Yubico } from '..';

test('Verify OTP', () => {
  const instance = new Yubico({
    clientId: process.env.CLIENT_ID,
    secretKey: process.env.SECRET_KEY,
  });

  expect(instance.verifyOtp(process.env.OTP)).toBe(false);
});
