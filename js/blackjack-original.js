let deck_id = "";
let player = {
    name: "player",
    cards: [],
    points: {
        ace1: 0,
        ace10: 0,
        final: 0
    }
};
let house = {
    name: "house",
    cards: [],
    points: {
        ace1: 0,
        ace10: 0,
        hiddenAce1: 0,
        hiddenAce10: 0,
        final: 0
    }
};

async function blackjack() {
    //New deck let url = "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=" + DECKAMOUNT;
    let url = "https://deckofcardsapi.com/api/deck/dkajikxjivr7/shuffle/";
    await fetch(url)
        .then((response) => response.json())
        .then((json) => {
            deck_id = json.deck_id;
        })
        .catch((error) => console.log(error));

    await drawCard(2, player);
    await drawCard(2, house);

    await getHand(player, false);
    await getHand(house, false);

    await startUI();
}

async function drawCard(amount, player, isHouseTurn) {
    let url = "https://deckofcardsapi.com/api/deck/" + deck_id + "/draw/?count=" + amount;

    await fetch(url)
        .then((response) => response.json())
        .then((json) => addToHand(json, player, isHouseTurn))
        .catch((error) => console.log(error))
}

async function addToHand(json, player, isHouseTurn) {
    let url = "https://deckofcardsapi.com/api/deck/" + deck_id + "/pile/" + player.name + "/add/?cards=";
    for (let i = 0; i < json.cards.length; i++) {
        player.cards.push(json.cards[i]);
        if (json.cards[i].value === "JACK" || json.cards[i].value === "QUEEN" || json.cards[i].value === "KING") {
            if (player.name === "house" && i === 0 && isHouseTurn !== true) {
                player.points.ace1 += 10;
                player.points.ace10 += 10;
            } else {
                player.points.ace1 += 10;
                player.points.ace10 += 10;

                player.points.hiddenAce1 += 10;
                player.points.hiddenAce10 += 10;
            }
        } else if (json.cards[i].value === "ACE") {
            if (player.name === "house" && i === 0 && isHouseTurn !== true) {
                player.points.ace1 += 1;
                player.points.ace10 += 10;
            } else {
                player.points.ace1 += 1;
                player.points.ace10 += 10;

                player.points.hiddenAce1 += 1;
                player.points.hiddenAce10 += 10;
            }
        } else {
            if (player.name === "house" && i === 0 && isHouseTurn !== true) {
                player.points.ace1 += parseInt(json.cards[i].value);
                player.points.ace10 += parseInt(json.cards[i].value);
            } else {
                player.points.ace1 += parseInt(json.cards[i].value);
                player.points.ace10 += parseInt(json.cards[i].value);

                player.points.hiddenAce1 += parseInt(json.cards[i].value);
                player.points.hiddenAce10 += parseInt(json.cards[i].value);
            }
        }

        if (i === json.cards.length - 1) {
            url += json.cards[i].code;
        } else {
            url += json.cards[i].code + ",";
        }
    }
    fetch(url)
        .then((response) => {
            if (response.status !== 200) {
                window.alert(response)
            }
        }).catch((error) => console.log(error))
}

async function getHand(player, isHouseTurn) {
    let url = "https://deckofcardsapi.com/api/deck/" + deck_id + "/pile/" + player.name + "/list/";
    await fetch(url)
        .then(function (response) {
            response.json()
                .then(function () {
                    let cards;
                    let element;
                    if (player.name === "player") {
                        cards = player.cards;
                        element = document.querySelector("#player-hand");
                    } else if (player.name === "house") {
                        cards = house.cards;
                        element = document.querySelector("#house-hand");
                    }
                    element.innerText = "";
                    for (let i = 0; i < cards.length; i++) {
                        if (i === 0 && player.name === "house" && isHouseTurn !== true) {
                            let img = document.createElement("img");
                            img.src = "cards/purple_back.png";
                            img.className = "card";
                            element.appendChild(img);
                        } else {
                            let img = document.createElement("img");
                            img.src = "cards/" + cards[i].code + ".png";
                            img.className = "card";
                            element.appendChild(img);
                        }
                    }

                })
        });
}

async function startUI() {
    document.querySelector("#player-points").innerText = player.points.ace1 + " / " + player.points.ace10;
    document.querySelector("#house-points").innerText = house.points.hiddenAce1 + " / " + house.points.hiddenAce10;

    let hitButton = document.createElement("button");
    hitButton.innerText = "HIT";
    hitButton.addEventListener("click", () => hit());

    let stayButton = document.createElement("button");
    stayButton.innerText = "STAY";
    stayButton.addEventListener("click", () => stay());

    document.querySelector("#blackjack-buttons").innerHTML = "";
    document.querySelector("#blackjack-buttons").appendChild(hitButton);
    document.querySelector("#blackjack-buttons").appendChild(stayButton);
}

async function updatePlayer() {
    document.querySelector("#player-points").innerText = player.points.ace1 + " / " + player.points.ace10;
}

async function updateHouse() {
    document.querySelector("#house-points").innerText = house.points.ace1 + " / " + house.points.ace10;
}

async function hit() {
    await drawCard(1, player);
    await getHand(player, false);
    await updatePlayer();
    await hitCheck();
}

async function stay() {
    await getHand(house, true);
    while (house.points.ace1 < 17 || house.points.ace10 < 17 && house.points.ace1 < player.points.ace1) {
        await drawCard(1, house);
        await getHand(house, true);
        await updateHouse();
    }
    await updateHouse();
    let resetButton = document.createElement("button");
    resetButton.innerText = "NEW GAME";
    resetButton.id = "reset-button";
    resetButton.addEventListener("click", () =>  {
        document.querySelector("#reset-button").remove();
        document.querySelector("#player-points").innerText = "";
        document.querySelector("#house-points").innerText = "";
        resetBlackjack();
    });
    document.querySelector("#blackjack-buttons").appendChild(resetButton);
    await stayCheck();
}

async function hitCheck() {
    if (player.points.ace1 > 21) {
        window.alert("HÄVISIT");
        let resetButton = document.createElement("button");
        resetButton.innerText = "NEW GAME";
        resetButton.id = "reset-button";
        resetButton.addEventListener("click", () =>  {
            document.querySelector("#reset-button").remove();
            document.querySelector("#player-points").innerText = "";
            document.querySelector("#house-points").innerText = "";
            resetBlackjack();
        });
        document.querySelector("#blackjack-buttons").appendChild(resetButton);
    }
}

async function stayCheck() {
    if (player.points.ace10 > 21) {
        player.points.final = player.points.ace1;
    } else {
        player.points.final = player.points.ace10;
    }

    if (house.points.ace10 > 21) {
        house.points.final = house.points.ace1;
    } else {
        house.points.final = house.points.ace10;
    }

    if (player.points.final > house.points.final) {
        window.alert("VOITIT");
    } else if (house.points.final > 21) {
        window.alert("VOITIT");
    } else if (player.points.final === house.points.final) {
        window.alert("TASAPELI");
    } else {
        window.alert("HÄVISIT");
    }

    console.log("player: " + player.points.final);
    console.log("house: " + house.points.final);
}

function resetBlackjack() {
    player = {
        name: "player",
        cards: [],
        points: {
            ace1: 0,
            ace10: 0
        }
    };
    house = {
        name: "house",
        cards: [],
        points: {
            ace1: 0,
            ace10: 0,
            hiddenAce1: 0,
            hiddenAce10: 0
        }
    };
    document.querySelector("#player-hand").innerText = "";
    document.querySelector("#house-hand").innerText = "";
    blackjack();
}

document.querySelector("#openBlackjack").addEventListener("click", function () {
    blackjack();
    document.getElementById("gameBackground").style.display = "flex";
});

function stopButton() {
    document.getElementById("gameBackground").style.display = "none";
}

fetchDeck.then()