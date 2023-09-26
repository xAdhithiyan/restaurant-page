import "./css/index.css";
import "./css/normalize.css";
import homepage, { navigationName } from "./componenets/homepage";
import menupage from "./componenets/menupage";
import contactpage from "./componenets/contactpage";

function main(){
    let navigation = document.querySelector(".navigation").childNodes;
    navigation = Array.from(navigation);    
    navigation.forEach(e => e.addEventListener("click", (event) => {
        if(event.target.textContent == "Home"){
            clear();
            homepage();
            main();
        }else if(event.target.textContent == "Menu"){
            clear();
            menupage();
            main();
        }else{
            clear();
            contactpage();
            main();
        }
    }))
}   
function clear(){
    document.querySelector(".content").innerHTML = "";
}

homepage();
main();