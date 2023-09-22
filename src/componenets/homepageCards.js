function homepageCards(mainCard,title, text){
    let card = document.createElement("div");
    card.classList.add("card");

    let heading = document.createElement("div");
    heading.textContent = title;
    card.appendChild(heading);

    let review = document.createElement("div");
    review.textContent = text;
    card.appendChild(review);

    mainCard.appendChild(card)

    
    
}

export default homepageCards;