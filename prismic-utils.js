var doctypes = {
  'works': {
    link: function(doc) {
      return '/' + doc.uid;
    }
  },
  'contact': {
    link: function(doc) {
      return '/' + doc.uid;
    }
  },
  'about': {
    link: function(doc) {
      return '/' + doc.uid;
    }
  },
  'services': {
    link: function(doc) {
      return '/' + doc.uid;
    }
  },
};

module.exports = {
  linkResolver: function(doc, ctx) {
    var resolver = doctypes[doc.type];
    if (typeof resolver !== 'undefined') {
      return resolver.link(doc);
    }
    return '/';
  }
};
