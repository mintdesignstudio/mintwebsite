var doctypes = {
  'article': {
    link: function(doc) {
      return '/article/' + doc.uid;
    }
  },
  'articles': {
    link: function(doc) {
      return '/articles/';
    }
  },
  'contact': {
    link: function(doc) {
      return '/contact/';
    }
  },
  'project': {
    link: function(doc) {
      return '/project/' + doc.uid;
    }
  },
  'projects': {
    link: function(doc) {
      return '/projects/';
    }
  },
  'service': {
    link: function(doc) {
      return '/service/' + doc.uid;
    }
  },
  'services': {
    link: function(doc) {
      return '/services/';
    }
  },
};

module.exports = {

  // apiEndpoint: 'https://mandarin.prismic.io/api',

  // -- Access token if the Master is not open
  // accessToken: 'xxxxxx',

  // OAuth
  // clientId: 'xxxxxx',
  // clientSecret: 'xxxxxx',

  // -- Links resolution rules
  // This function will be used to generate links to Prismic.io documents
  // As your project grows, you should update this function according to your routes

  // how about https?

  linkResolver: function(doc, ctx) {
    var resolver = doctypes[doc.type];
    if (typeof resolver !== 'undefined') {
      return resolver.link(doc);
    }
    return '/';
  }
};
