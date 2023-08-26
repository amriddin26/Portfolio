const circles = document.querySelectorAll('.circles1');
circles.forEach(elem=>{
    var dots = elem.getAttribute("data-dote");
    var marked = elem.getAttribute("data-percent");
    var percent = Math.floor(dots*marked/100);
    var points = "";
    var rotate = 360 / dots;


    for(let i = 0 ; i < dots ; i++){
        points += `<div class="points" style="--i:${i}; --rot:${rotate}deg"></div>`;
    } 
    elem.innerHTML = points;


    const pointsMarked = elem.querySelectorAll('.points');
    for(let i = 0 ; i < percent ; i++){
        pointsMarked[i].classList.add('marked')
    }
});