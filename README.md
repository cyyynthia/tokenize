# Tokenize
[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/G2G71TSDF)<br>
[![License](https://img.shields.io/github/license/cyyynthia/tokenize.svg?style=flat-square)](https://github.com/cyyynthia/tokenize/blob/master/LICENSE)

A universal token format for authentication. Designed to be secure, flexible, and usable anywhere.

## Implementation
This repository contains the reference Tokenize implementation, in NodeJS. You can find out how to install and use it
in USAGE.md.

Here is a list of other implementations:
 - Java (1.8+): https://github.com/vinceh121/tokenize4j
 - Rust: https://github.com/TheOddGarlic/tokenize-rs
 - ...your implementation! Feel free to shoot a PR if you made an implementation. I'd love to list it!

## Security
Here are some basic guidelines implementations should follow to ensure they have a safe piece of software. It isn't
a magic formula and doesn't include everything, so make sure you give extra attention not introducing vulnerabilities.

 - **Check absolutely everything**<br>
   Tokens are pieces of data you can trust as much as the Chinese government. You will receive invalid ones, and some
   people will attempt to tamper tokens. Make sure to check absolutely everything, and only perform operations on it
   when you know it's safe.

 - **Be aware of timing attacks**<br>
   When checking for the token signature, **ensure you are using a safe equality check**. A safe check is one that
   takes the exact same time, whether the two values match or not.

### Reporting a vulnerability
For security vulnerabilities within the **reference implementation**, please shoot me an email at cynthia@cynthia.dev
so I can give it a look, and issue appropriated fixes and security advisories.

For other implementation, refer to the security policies established by implementation maintainers.

## Specification
The Tokenize Token Format specification can be found in SPEC.md.
