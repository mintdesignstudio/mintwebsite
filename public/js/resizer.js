var mint = {
    resizeTimer:    undefined,
    workParent:     undefined,
    works:          [],
    current_work:   undefined,
    other_rect:     undefined,
    other_height:   undefined
};

function getDIVs(collection) {
    return Array.prototype.filter.call(collection, function(el){
        return el.nodeName === 'DIV';
    });
}

function setCurrentHeight(el, height) {
    el.setAttribute("style", "height:"+height+"px");
    el.style.height = height+'px';
}

function getWorks() {
    mint.workParent = document.getElementsByClassName('work');
    mint.workParent = getDIVs(mint.workParent);

    mint.works = [];
    mint.workParent.forEach(function(el) {
        mint.current_work = getDIVs(el.getElementsByClassName('wrap current'));
        if (mint.current_work.length === 0) {
            return mint.works;
        }

        mint.works = getDIVs(el.getElementsByClassName('wrap'));
    });

    return mint.works;
}

function resizeImages() {
    mint.works = getWorks();
    if (mint.works.length === 0) {
        return;
    }

    mint.other_rect = mint.works[1].getBoundingClientRect();
    mint.other_height = mint.other_rect.width * 0.5625;

    mint.works.forEach(function(work, i) {
        setCurrentHeight(work, Math.floor(mint.other_height) * (i === 0 ? 2 : 1));
    });
}

window.addEventListener('resize', function(event) {
    clearTimeout(mint.resizeTimer);
    if (document.body.clientWidth < 960) {
        mint.works = getWorks();
        mint.works.forEach(function(work) {
            work.removeAttribute('style');
        });
        return;
    }
    mint.resizeTimer = setTimeout(resizeImages, 50);
});

window.addEventListener('load', function(event) {
    if (document.body.clientWidth < 960) {
        return;
    }
    resizeImages();
});
