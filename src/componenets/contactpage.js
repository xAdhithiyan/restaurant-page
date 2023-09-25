import { navigationName } from "./homepage";
import "../css/contactpage.css"
import phone from "/images/phone.svg"
import store from "/images/store.svg"
import footer from "./footer";
import contactAnimation from "../animation/animateContactPage";


function contactpage(){
    const content = document.querySelector(".content");

    const contactPageConent = document.createElement("div");
    contactPageConent.classList.add("contactPage");
    
    /* navigation */
    const navigation = document.createElement("div");
    navigation.classList.add("navigation");
    
    navigationName("Home", navigation);
    navigationName("Menu", navigation);
    navigationName("Contact", navigation);

    contactPageConent.appendChild(navigation);
    contactPageConent.appendChild(document.createElement("hr"));
    
    /* outer loayout */
    let outerMenu = document.createElement("div");
    outerMenu.classList.add("outerMenu");
    let menu = document.createElement("div");
    menu.classList.add("menu");

    /* contacts */
    menu.appendChild(contacts("66666 99999 / 99999 66666", phone));
    menu.appendChild(document.createElement("hr"))
    menu.appendChild(contacts("Les Halles Castellanes, Rue de l'Herberie, 34000 Montpellier, France", store))
    
    /* maps */
    let maps = document.createElement("iframe");
    maps.classList.add("maps")
    maps.setAttribute("src", "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2888.8261255859447!2d3.871937893016181!3d43.610161780715536!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12b6afee8b023451%3A0x34940ef9425f292!2zQ3LDqG1lIGRlIGxhIENyw6htZQ!5e0!3m2!1sen!2sin!4v1695662811672!5m2!1sen!2sin")
    maps.setAttribute("width", "600");
    maps.setAttribute("height", "400");
    maps.setAttribute("loading", "lazy");
    maps.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
    maps.setAttribute("style", "border:2px solid black;border-radius:5px")
    menu.appendChild(maps);


    outerMenu.appendChild(menu);
    contactPageConent.appendChild(outerMenu);
    contactPageConent.appendChild(document.createElement("hr"))
    contactPageConent.appendChild(footer());
    content.appendChild(contactPageConent);

    contactAnimation();
}


function contacts(number, img){
    let contact = document.createElement("div");
    let contactImg = document.createElement("img");
    contactImg.setAttribute("src", img);
    let contactNumber = document.createElement("div");
    contactNumber.textContent = number;

    contact.appendChild(contactImg);
    contact.appendChild(contactNumber);
    return contact
}
export default contactpage;