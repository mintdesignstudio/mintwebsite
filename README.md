Mint Design Studio website
===========

Mint's webside runs on [Heroku](http://heroku.com) with content stored in [Prismic.io](http://prismic.io) and website distributed via [Amazon CloudFront](http://aws.amazon.com/cloudfront/).

#Requirements

 * [https://www.npmjs.com/package/foreman](Foreman)

#Install
```
npm install
```
Add necessary credentials for authenticating with Prismic in ```.env``` file. **DO NOT** commit your credentials!

#Development
```
npm run dev
```

#Prepare for deployment
```
npm run preprod
```
Runs ./preprod.js which minifies JavaScript, CSS and HTML, and inlines JS and CSS in the HTML. Images are also compressed.

#Caching
CloudFront is setup to cache everything in the public directory for three months, and everything else for 24 hours. Express serves all static content with a cache expiration set to three months. The cache settings in Express is probably not necessary due to the cache settings in CloudFront.

CloudFront accepts requests from www.domain.com The domain host forwards requests to domain.com to www.domain.com, without cloaking.

#Enable under construction page
Set the ```construction``` property to ```true``` in ```config.js```, commit and push the changes.

#Bypass the under construction page
Go to http://webadress.com/?bypass=true to set a cookie called ```in_dev```. This will let you bypass the under construction page for the next 2 hours.

#App setup

The app runs on Express and uses [https://github.com/prismicio/javascript-kit](Prismic's JavaScript Kit) for interaction with Prismic.
```app/web.js``` is the module that sets up the server. All routes are in ```app/router.js```, and the main app logics are in ```app/app.js```. ```app/modules/common.js``` handles content that is common for all pages, like about and contact info. ```app/modules/projects.js``` handles the projects only.

[Handlebars](http://handlebarsjs.com) is used as the template engine.
