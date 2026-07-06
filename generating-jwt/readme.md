# generating-jwts

This repository contains tools and examples for generating JSON Web Tokens (JWTs) using TypeScript.

## Table of Contents

- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [License](#license)

## Introduction

JSON Web Tokens (JWTs) are an open, industry standard [RFC 7519](https://tools.ietf.org/html/rfc7519) method for representing claims securely between two parties. This repository provides examples and utilities for generating JWTs in JavaScript and TypeScript.

## Getting Started

To get started with this project, clone the repository:

```
git clone https://github.com/dev-vs-ciso/generating-jwts.git
cd generating-jwts
```

### Prerequisites

- Node.js (version 12.0.0 or higher)
- npm (usually comes with Node.js)

### Installation

Install the necessary dependencies:

```
npm install
```

## Usage

This project provides a simple API for generating JWTs:

```bash
npm run unsigned
```
generates an unsigned JWT, using the default algorithm (i.e. "none").


```bash
npm run signed-hmac
```

generates a signed JWT using HMAC SHA-256.

```bash
npm run signed-rsa
```

generates a signed JWT using RSA SHA-256.

The JWTs are printed to the console, along with the decoded payload. The initial payload is defined in the `data.ts` file.


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
