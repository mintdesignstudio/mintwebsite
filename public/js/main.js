(function(){
    let images = [];
    let backgrounds = [];
    let prevScrollTop;
    let monitorIntervalId;

    function getScrollTop() {
        return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    }

    function monitorLazyloads() {
        if (images.length === 0 &&
            backgrounds.length === 0) {
            window.clearInterval(monitorIntervalId);
            return;
        }

        if (prevScrollTop === getScrollTop()) {
            return;
        }

        prevScrollTop = getScrollTop();
        let vWidth    = window.innerWidth || document.documentElement.clientWidth;
        let vHeight   = window.innerHeight || document.documentElement.clientHeight;

        for (var i=images.length-1; i>=0; --i) {
            let rect = images[i].getBoundingClientRect();
            if (!isElementVisible(images[i])) {
                continue;
            }

            loadHighresImage(images[i]);
            images.splice(i, 1);
        }

        for (var i=backgrounds.length-1; i>=0; --i) {
            let el = backgrounds[i];
            if (!isElementVisible(el)) {
                continue;
            }

            let style = createResponsiveBgStyles(el.getAttribute('id'), {
                small:  el.dataset.small,
                medium: el.dataset.medium,
                large:  el.dataset.large,
                xlarge: el.dataset.xlarge,
            });
            el.appendChild(style);

            backgrounds.splice(i, 1);
        }
    }

    function onHighresImageLoaded(event) {
        event.target.removeEventListener('load', onHighresImageLoaded);
        event.target.setAttribute('class', 'loaded');
    }

    function createPictureSource(srcset, media) {
        let el = document.createElement('source');
        el.setAttribute('srcset', srcset);
        el.setAttribute('media', media);
        return el;
    }

    function createResponsiveBgStyles(id, img) {
        let style = document.createElement('style');
        let css =
            //"@media screen and (max-width:40em){#"+id+"{background-image:url('"+img.small+"');}}"+
            "@media screen and (min-width:40em) and (max-width:60em){#"+id+"{background-image:url('"+img.medium+"');}}"+
            "@media screen and (min-width:60em) and (max-width:80em){#"+id+"{background-image:url('"+img.large+"');}}"+
            "@media screen and (min-width:80em){#"+id+"{background-image:url('"+img.xlarge+"');}}";
        style.appendChild(document.createTextNode(css));
        return style;
    }

    function loadHighresImage(el) {
        el.addEventListener('load', onHighresImageLoaded);
        el.parentElement.insertBefore(createPictureSource(el.dataset.xlarge, '(min-width: 100em)'), el);
        el.parentElement.insertBefore(createPictureSource(el.dataset.large,  '(min-width: 80em) and (max-width: 100em)'), el);
        el.parentElement.insertBefore(createPictureSource(el.dataset.medium, '(min-width: 60em) and (max-width: 80em)'), el);
        el.parentElement.insertBefore(createPictureSource(el.dataset.small,  '(min-width: 40em) and (max-width: 60em)'), el);
    }

    function isElementVisible(el) {
        let rect     = el.getBoundingClientRect();
        let vWidth   = window.innerWidth || document.documentElement.clientWidth;
        let vHeight  = window.innerHeight || document.documentElement.clientHeight;
        // const efp    = function (x, y) { return document.elementFromPoint(x, y) };

        // Return false if it's not in the viewport
        if (rect.right  < 0
         || rect.bottom < 0
         || rect.left   > vWidth
         || rect.top    > vHeight) {
            return false;
        }

        return true;
        // Return true if any of its four corners are visible
        // Didn't work for me
        // return (
        //       el.contains(efp(rect.left,  rect.top))
        //   ||  el.contains(efp(rect.right, rect.top))
        //   ||  el.contains(efp(rect.right, rect.bottom))
        //   ||  el.contains(efp(rect.left,  rect.bottom))
        // );
    }

    function getHeroes(selectors) {
        for (var i=0; i<selectors.length; ++i) {
            let hero = document.querySelector(selectors[i]);
            if (hero) {
                backgrounds.push(hero);
            }
        }
    }

    function getElementsByClasses(classes) {
        let elements = [];
        for (var i=0; i<classes.length; ++i) {
            let els = document.getElementsByClassName(classes[i]);
            if (els) {
                elements = elements.concat(Array.prototype.slice.call(els));
            }
        }
        return elements;
    }

    function onDOMContentLoaded(event) {
        monitorIntervalId = window.setInterval(monitorLazyloads, 250);

        let lazyloads = document.getElementsByClassName('lazyload');
        for (var i=0; i<lazyloads.length; ++i) {
            images.push(lazyloads[i]);
        }

        getHeroes(['body#frontpage .hero', 'body#about .hero']);

        let els = getElementsByClasses(['project', 'photo', 'background']);
        if (els) {
            backgrounds = backgrounds.concat(els);
        }
    }

    document.addEventListener('DOMContentLoaded', onDOMContentLoaded);

}());
