import animate from "/node_modules/animateplus/animateplus.js";

function menuAnimation(){
    let allDiv = document.querySelector(".menuPage").childNodes;
    allDiv = Array.from(allDiv);
    allDiv.splice(1,1)
    allDiv.splice(2,1)
    
    let pastry = document.querySelector(".pastry").childNodes;
    pastry = Array.from(pastry);
    let desert = document.querySelector(".desert").childNodes;
    desert = Array.from(desert);
    let drink = document.querySelector(".drink").childNodes;
    drink = Array.from(drink);

    animate({
        elements: allDiv[0],
        duration: 3000,
        delay: index => index * 100, 
        transform: ["translateY(-200%)", "translateY(0%)"]
    })
    animate({
        elements: allDiv[2],
        duration: 3000,
        delay: index => index * 100, 
        transform: ["translateY(150%)", "translate(0%)"]
    })
    animate({
        elements: pastry,
        duration: 3000,
        delay: index => index * 100,
        transform: ["translate(-100%)", "translate(0%)"]
    })
    animate({
        elements: desert,
        duration: 3000,
        delay: index => index * 100,
        transform: ["translate(-100%)", "translate(0%)"]
    })
    animate({
        elements: drink,
        duration: 3000,
        delay: index => index * 100,
        transform: ["translate(-100%)", "translate(0%)"]
    })
}

export default menuAnimation;