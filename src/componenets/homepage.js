import homepageCards from "./homepageCards";
import footer from "./footer";
import "../css/homepage.css"
import logo from "/images/logo.jpeg"
import animation from "../animation/animateHomePage";

function homepage(){
    const content = document.querySelector(".content");
    const homePageContent = document.createElement("div");
    homePageContent.classList.add("homePage");


    /* navigation */
    const navigation = document.createElement("div");
    navigation.classList.add("navigation");
    
    navigationName("Home", navigation);
    navigationName("Menu", navigation);
    navigationName("Contact", navigation);

    homePageContent.appendChild(navigation);
    homePageContent.appendChild(document.createElement("hr"));


    /* heading */
    let heading = document.createElement("div");
    heading.classList.add("heading");

    let headingName = document.createElement("img");
    headingName.setAttribute("src", logo)
    let subHeadingName = document.createElement("div")
    subHeadingName.textContent = "Since 1927"
    
    heading.appendChild(headingName);
    heading.appendChild(subHeadingName)
    homePageContent.appendChild(heading);

    /* cards */
    let mainCard = document.createElement("div");
    mainCard.classList.add("mainCard");
    homepageCards(mainCard, "The New York Times" ,5 , "\"In the heart of the city that never sleeps, this pastry restaurant is a beacon of sweetness. Its elegant pastries and cakes are a true culinary masterpiece, elevating dessert to an art form.\"");
    homepageCards(mainCard, "Food & Wine Magazine" ,5 ,  "\"This pastry haven is a must-visit for anyone seeking an unforgettable dessert experience. Each bite is a symphony of flavors and textures, setting a new standard for pastry excellence.\"");
    homepageCards(mainCard, "The Michelin Guide",4 ,  "\"Earning our coveted star, this pastry restaurant is a destination for those seeking refined, exquisite desserts. With impeccable craftsmanship and a dedication to quality, it's a sweet revelation for discerning palates.\"");
    homePageContent.appendChild(mainCard);

    homePageContent.appendChild(document.createElement("hr"));
    /* footer */
    homePageContent.appendChild(footer())
    
    content.appendChild(homePageContent)
    animation();
}

function navigationName(str , navigation){
    let div = document.createElement("div");
    let btn = document.createElement("button");
    btn.textContent = str;
    div.appendChild(btn)
    navigation.appendChild(div);
}

export default homepage;
export {navigationName};
