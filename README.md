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

#Enable under construction page
Set the ```construction``` property to ```true``` in ```config.js```.

#Bypass the under construction page
Go to http://webadress.com/?bypass=true to set a cookie called ```in_dev```. This will let you bypass the under construction page for the next 2 hours.
