import animate from "/node_modules/animateplus/animateplus.js";

function animation(){
    let allDiv = document.querySelector(".homePage").childNodes
    allDiv = Array.from(allDiv)
    allDiv.splice(1,1)
    allDiv.splice(3,1)
    
    let cards = allDiv[2].childNodes
    cards = Array.from(cards)
    console.log(allDiv)

    animate({
        elements: allDiv[0],
        duration: 3000,
        delay: index => {index * 100}, 
        transform: ["translateY(-200%)", "translateY(0%)"]
    })
        
    animate({
        elements: allDiv[1],
        duration: 3000,
        delay: index => index * 100, 
        transform: ["scale(0)", "scale(1)"]
    })
    animate({
        elements: cards[1],
        duration: 3000,
        delay: index => index * 100, 
        transform: ["scale(0)", "scale(1)"]
    })
    animate({
        elements: cards[0],
        duration: 3000,
        delay: index => index * 100, 
        transform: ["translate(-100%)", "translate(0%)"]
    })
    animate({
        elements: cards[2],
        duration: 3000,
        delay: index => index * 100, 
        transform: ["translate(100%)", "translate(0%)"]
    })
    animate({
        elements: allDiv[3],
        duration: 3000,
        delay: index => index * 100, 
        transform: ["translateY(150%)", "translate(0%)"]
    })
}

export default animation;
