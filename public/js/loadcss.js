var cb = function() {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = '/public/css/style.css';
    var h = document.getElementsByTagName('head')[0];
    h.appendChild(l);
};
// var raf = window.requestAnimationFrame ||
//           window.mozRequestAnimationFrame ||
//           window.webkitRequestAnimationFrame ||
//           window.msRequestAnimationFrame;
// if (raf) {
//     raf(cb);
// } else {
    window.addEventListener('DOMContentLoaded', cb);
// }
