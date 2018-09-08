const linkTable = {
  'frontpage': doc => '/',
  'about':     doc => '/about',
  'contact':   doc => '/contact',
  'project':   doc => '/work/' + doc.uid,
  'works':     doc => '/works',
  'services':  doc => '/services',
};

const linkResolver = function(doc) {
  let resolver = linkTable[doc.type];
  if (!resolver) {
    return '/';
  }
  return !resolver ? '/' : resolver(doc);
};

module.exports = linkResolver;
