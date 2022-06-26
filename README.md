# Yubico-JS

![npm](https://img.shields.io/npm/v/yubico-js?logo=npm&logoColor=%23ca0100&style=flat-square) ![node-current](https://img.shields.io/node/v/yubico-js?style=flat-square)

An implementation of the [Yubico Validation Protocol](https://developers.yubico.com/yubikey-val/Validation_Protocol_V2.0.html).

## Features

- Verify Yubikey OTPs

## Setup guide

1. Clone the repository.
   ```bash
   npm install
   ```
2. Get client ID and secret from [Yubico](https://upgrade.yubico.com/getapikey/).
3. Create `.env` file with the following content:

   ```bash
   CLIENT_ID="CLIENT_ID"
   SECRET_KEY="SECRET_KEY"
   OTP="any_otp"

   ```

4. Run the tests.
   ```bash
   npm test
   ```

## Usage

```js
import { Yubico } from 'yubico-js';

const yubico = new Yubico({
  clientId: 'YOUR_CLIENT_ID',
  secretKey: 'YOUR_SECRET_KEY',
});

// To verify otp
try {
  yubico.verifyOtp(otpString);
} catch (e) {
  console.log(e);
}
```

## Contributing

![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)
[![Bugs](https://img.shields.io/static/v1?label=Bugs&message=Report&color=red&style=flat-square)](https://github.com/mohitkyadav/yubico-js/issues)

## License

![GitHub](https://img.shields.io/github/license/mohitkyadav/yubico-js?logo=github&style=flat-square)
