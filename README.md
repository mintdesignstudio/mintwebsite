mintwebsite
===========

Mint Design Studio website

#Install
```
npm install
```
Add necessary credentials for authenticating with Prismic in .env file. **DO NOT** commit the credentials!

#Development
```
npm run dev
```

#Links
CloudFront endpoint: [http://d1mlyxwjwohusp.cloudfront.net/](http://d1mlyxwjwohusp.cloudfront.net/)

#Caching
CloudFront is setup to cache everything in the public directory for three months, and everything else for 14 days. Express serves all static content with a cache expiration set to three months.
