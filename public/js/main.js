(function(){
    function addFont() {
        var style = document.createElement('style');
        style.rel = 'stylesheet';
        document.head.appendChild(style);
        style.textContent = localStorage.DIN_OT;
    }

    try {
        if (localStorage.DIN_OT) {
            addFont();
        } else {
            var request = new XMLHttpRequest();
            request.open('GET', '/public/css/fonts.css', true);

            request.onload = function() {
                if (request.status >= 200 && request.status < 400) {
                    localStorage.DIN_OT = request.responseText;
                    addFont();
                }
            }

            request.send();
        }
    } catch(ex) {
        // maybe load the font synchronously for woff-capable browsers
        // to avoid blinking on every request when localStorage is not available
    }
}());

window.mint_menu;

function scrollY() {
    if (window.pageYOffset !== undefined) {
        return window.pageYOffset;
    }

    return (document.documentElement ||
        document.body.parentNode ||
        document.body).scrollTop;
}

function changeOpacity(element) {
    var value = (scrollY() / 200);
    value = value > 1 ? 1 : value;
    value *= 0.7;
    element.style.backgroundColor = 'rgba(0,0,0,'+value+')';
}

window.addEventListener('scroll', function(e) {
    if (!window.mint_menu) {
        return;
    }
    changeOpacity(window.mint_menu);
});

document.addEventListener('DOMContentLoaded', function(event) {
    window.mint_menu = document.getElementById('menu');
    changeOpacity(window.mint_menu);

    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = '/public/css/style.css';
    var h = document.getElementsByTagName('head')[0];
    h.appendChild(l);
});
