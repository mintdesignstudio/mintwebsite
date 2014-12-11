Mint Design Studio website
===========

Mint's webside runs on [Heroku](http://heroku.com) with content stored in [Prismic.io](http://prismic.io) and website distributed via [Amazon CloudFront](http://aws.amazon.com/cloudfront/).

#Install
```
npm install
```
Add necessary credentials for authenticating with Prismic in ```.env``` file. **DO NOT** commit your credentials!

#Development
```
npm run dev
```

#Caching
CloudFront is setup to cache everything in the public directory for three months, and everything else for 24 hours. Express serves all static content with a cache expiration set to three months.

#Enable under construction page
Set the ```construction``` property to ```true``` in ```config.js```, commit and push the changes.

#Bypass the under construction page
Go to http://webadress.com/?bypass=true to set a cookie called ```in_dev```. This will let you bypass the under construction page for the next 2 hours.

#App setup

The app runs on Express and uses [https://github.com/prismicio/javascript-kit](Prismic's JavaScript Kit) for interaction with Prismic.
```app/web.js``` is the module that sets up the server. All routes are in ```app/router.js```, and the main app logics are in ```app/app.js```. ```app/modules/common.js``` handles content that is common for all pages, like about and contact info. ```app/modules/projects.js``` handles the projects only.

[Handlebars](http://handlebarsjs.com) is used as the template engine.
