!function(){function e(){var e=document.createElement("style");e.rel="stylesheet",document.head.appendChild(e),e.textContent=localStorage.DIN_OT}try{if(localStorage.DIN_OT)e();else{var t=new XMLHttpRequest;t.open("GET","/public/css/fonts.css",!0),t.onload=function(){t.status>=200&&t.status<400&&(localStorage.DIN_OT=t.responseText,e())},t.send()}}catch(n){}}();