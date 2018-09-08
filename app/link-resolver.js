const linkTable = {
  'frontpage': doc => '/',
  'about':     doc => '/about',
  'contact':   doc => '/contact',
  'project':   doc => '/work/' + doc.uid,
  'works':     doc => '/works',
  'services':  doc => '/services/#' + doc.uid,
};

const linkResolver = function(doc, type) {
  let docType = doc.type ? doc.type : type;
  let resolver = linkTable[docType];
  if (!resolver) {
    return '/';
  }
  return !resolver ? '/' : resolver(doc);
};

module.exports = linkResolver;
