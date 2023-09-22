import homepageCards from "./homepageCards";
import footer from "./footer";

function homepage(){
    const content = document.querySelector(".content");
    
    /* navigation */
    const navigation = document.createElement("div");
    navigation.classList.add("navigation");
    
    navigationName("Home", navigation);
    navigationName("Menu", navigation);
    navigationName("Contact", navigation);

    content.appendChild(navigation);
    content.appendChild(document.createElement("hr"));


    /* heading */
    let heading = document.createElement("div");
    heading.classList.add("heading");

    let headingName = document.createElement("div");
    headingName.textContent = "Crème de la Crust";
    let subHeadingName = document.createElement("div")
    subHeadingName.textContent = "Since 1927"
    
    heading.appendChild(headingName);
    heading.appendChild(subHeadingName)
    content.appendChild(heading);

    /* cards */
    let mainCard = document.createElement("div");
    mainCard.classList.add("MainCard");
    homepageCards(mainCard, "The New York Times" , "In the heart of the city that never sleeps, this pastry restaurant is a beacon of sweetness. Its elegant pastries and cakes are a true culinary masterpiece, elevating dessert to an art form.");
    homepageCards(mainCard, "Food & Wine Magazine" , "This pastry haven is a must-visit for anyone seeking an unforgettable dessert experience. Each bite is a symphony of flavors and textures, setting a new standard for pastry excellence.");
    homepageCards(mainCard, "The Michelin Guide", "Earning our coveted star, this pastry restaurant is a destination for those seeking refined, exquisite desserts. With impeccable craftsmanship and a dedication to quality, it's a sweet revelation for discerning palates.");
    content.appendChild(mainCard);

    /* footer */
    content.appendChild(footer())
    
}

function navigationName(str , navigation){
    let div = document.createElement("div");
    div.textContent = str;
    navigation.appendChild(div);
}

export default homepage;
