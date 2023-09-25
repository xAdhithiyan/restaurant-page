import animate from "/node_modules/animateplus/animateplus.js";

function contactAnimation(){
    let allDiv = document.querySelector(".contactPage").childNodes;
    allDiv = Array.from(allDiv);
    allDiv.splice(1,1);
    allDiv.splice(2,1);

    let contacts = document.querySelector(".menu").childNodes;
    contacts = Array.from(contacts);

    animate({
        elements: allDiv[0],
        duration: 3000,
        delay: index => index * 100, 
        transform: ["translateY(-200%)", "translateY(0%)"]
    })
    animate({
        elements: contacts[0],
        duration: 3000,
        delay: index => index * 100, 
        transform: ["skewX(180deg)", "skewX(0deg)"]
    })
    animate({
        elements: contacts[2],
        duration: 3000,
        delay: index => index * 100, 
        transform: ["skewX(180deg)", "skewX(0deg)"]
    })
    animate({
        elements: contacts[3],
        duration: 3000,
        delay: index => index * 100, 
        transform: ["skewX(180deg)", "skewX(0deg)"]
    })

    animate({
        elements: allDiv[2],
        duration: 3000,
        delay: index => index * 100, 
        transform: ["translateY(150%)", "translate(0%)"]
    })
}

export default contactAnimation