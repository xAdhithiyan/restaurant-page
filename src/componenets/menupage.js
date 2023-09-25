import { navigationName } from "./homepage";
import "../css/menupage.css"
import footer from "./footer";
import menuAnimation from "../animation/animationMenuPage";
import pastry1 from "/images/pastry-1.jpg"
import pastry2 from "/images/pastry-2.jpg"
import pastry3 from "/images/pastry-3.jpg"
import desert1 from "/images/desert-1.jpg"
import desert2 from "/images/desert-2.jpg"
import desert3 from "/images/desert-3.jpg"
import desert4 from "/images/desert-4.jpg"
import desert5 from "/images/desert-5.jpg"
import drink1 from "/images/drink-1.jpg"
import drink2 from "/images/drink-2.jpg"
import drink3 from "/images/drink-3.jpg"
import drink4 from "/images/drink-4.jpg"
import drink5 from "/images/drink-5.jpg"

function menupage(){
    const content = document.querySelector(".content");

    const menuPageConent = document.createElement("div");
    menuPageConent.classList.add("menuPage");
    
    /* navigation */
    const navigation = document.createElement("div");
    navigation.classList.add("navigation");
    
    navigationName("Home", navigation);
    navigationName("Menu", navigation);
    navigationName("Contact", navigation);

    menuPageConent.appendChild(navigation);
    menuPageConent.appendChild(document.createElement("hr"));

    let outerMenu = document.createElement("div");
    outerMenu.classList.add("outerMenu");
    let menu = document.createElement("div");
    menu.classList.add("menu");

    /* title */
    let title = document.createElement("div");
    title.classList.add("title");
    let div1 = document.createElement("div");
    div1.textContent = "THE";
    let div2 = document.createElement("div");
    div2.textContent = "MENU";
    title.appendChild(div1);
    title.appendChild(div2);
    title.appendChild(document.createElement("hr"));

    /* section-1 */
    let pastry = document.createElement("section");
    pastry.classList.add("pastry");
    let pastryTitle = document.createElement("div");
    pastryTitle.textContent = "Pastries";
    pastry.appendChild(pastryTitle);
    pastry.appendChild(food(pastry1, "Pain au Chocolat", "$15"));
    pastry.appendChild(food(pastry2, "Chausson aux Pommes", "$15"));
    pastry.appendChild(food(pastry3, "Pain aux Raisins", "$10"));

    /* section 2 */
    let desert = document.createElement("section");
    desert.classList.add("desert");
    let deserTitle = document.createElement("div");
    deserTitle.textContent = "Deserts";
    desert.appendChild(deserTitle);
    desert.appendChild(food(desert1, "Crème Brûlée", "$12"));
    desert.appendChild(food(desert2, "Tarte Tatin", "$12"));
    desert.appendChild(food(desert3, "Mousse au Chocolat", "$20"));
    desert.appendChild(food(desert4, "Tarte aux Fraises", "$15"));
    desert.appendChild(food(desert5, "Madeleines", "$8"));

    /* section 3 */
    let drink = document.createElement("section");
    drink.classList.add("drink");
    let drinkTitle = document.createElement("div");
    drinkTitle.textContent = "Drinks";
    drink.appendChild(drinkTitle);
    drink.appendChild(food(drink1, "Café Crème", "$8"));
    drink.appendChild(food(drink2, "Café Noir", "$8"));
    drink.appendChild(food(drink3, "Chocolat Chaud", "$12"));
    drink.appendChild(food(drink4, "Thé", "$10"));
    drink.appendChild(food(drink5, "Eau Gazeuse", "$12"));


    menu.appendChild(title);
    menu.appendChild(pastry);
    menu.appendChild(desert);
    menu.appendChild(drink);
    outerMenu.appendChild(menu);
    menuPageConent.appendChild(outerMenu);
    menuPageConent.appendChild(document.createElement("hr"));
    /* footer */
    menuPageConent.appendChild(footer())

    content.appendChild(menuPageConent);

    menuAnimation()
    
}
function food(image, heading, amount){
    let parent = document.createElement("div");
    let img = document.createElement("img");
    img.setAttribute("src", image);
    let div = document.createElement("div");
    div.textContent = heading;
    let price = document.createElement("div");
    price.textContent = amount;
    
    parent.appendChild(img);
    parent.appendChild(div);
    parent.appendChild(price);
    return parent;
}

export default menupage;