let mCards = []
let betAmount = 0
let mInsured = false
let mPlayer = {
    name: "player",
    cards: [],
    money: 0,
    points: {
        ace1: 0,
        ace11: 0,
        final: 0
    }
}
let mPlayerSplit = {
    name: "playerSplit",
    cards: [],
    points: {
        ace1: 0,
        ace11: 0,
        final: 0
    }
}

let mHouse = {
    name: "house",
    cards: [],
    points: {
        ace1: 0,
        ace11: 0,
        hiddenAce1: 0,
        hiddenAce11: 0,
        final: 0
    }
}

function bjPlayButton() {
    playBlackjack()
    document.getElementById("play-button").setAttribute("class", "hidden")
}

function bjResetButton() {
    resetBlackjack()
    playBlackjack()
    document.getElementById("reset-button").setAttribute("class", "hidden")
}

function updatePlayerMoney() {
    db.collection("users").doc(firebase.auth().currentUser.uid).get()
        .then((doc) => {
            mPlayer.money = parseInt(doc.data().money)
            document.querySelector("#player-money").textContent = mPlayer.money
        }).catch((error) => console.log(error))
}

function victory() {
    incrementMoney(betAmount * 2)
    updatePlayerMoney()
    updateButtons()
    console.log("won")
}

function tie() {
    incrementMoney(betAmount)
    updateButtons()
    console.log("tied")
}

function lost() {
    updateButtons()
    console.log("lost")
}

function victorySplit() {
    incrementMoney(betAmount * 2)
    updatePlayerMoney()
    hideButton("#hit-button-split")
    hideButton("#stay-button-split")
    console.log("won split")
}

function tieSplit() {
    incrementMoney(betAmount)
    hideButton("#hit-button-split")
    hideButton("#stay-button-split")
    console.log("tied split")
}

function lostSplit() {
    hideButton("#hit-button-split")
    hideButton("#stay-button-split")
    console.log("lost split")
}

function updateButtons() {
    showButton("#reset-button")
    hideButton("#hit-button")
    hideButton("#stay-button")
    hideButton("#double-button")
    hideButton("#insurance-button")
    hideButton("#split-button")
}

function playBlackjack() {
    betAmount = document.querySelector("#bet-amount").value
    decrementMoney(betAmount)
    updatePlayerMoney()
    new Promise(resolve => {
        //New deck let url = "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=" + DECKAMOUNT
        //NORMAL let url = "https://deckofcardsapi.com/api/deck/dkajikxjivr7/shuffle/"
        //REMOTE let url = "http://joy.karaoui.fi:8000/api/deck/82hvrjdlf915/shuffle/"
        let url = "http://192.168.1.5:8000/api/deck/82hvrjdlf915/shuffle/"
        fetch(url)
            .then(response => response.json())
            .then(json => {
                resolve(json.deck_id)
            })
            .catch(error => console.log(error))
    }).then(deck_id => {
        return new Promise(resolve => {
            //ORIGINAL let url = "https://deckofcardsapi.com/api/deck/" + deck_id + "/draw/?count=52"
            //REMOTE let url = "http://joy.karaoui.fi:8000/api/deck/" + deck_id + "/draw/?count=52"
            let url = "http://192.168.1.5:8000/api/deck/" + deck_id + "/draw/?count=52"


            fetch(url)
                .then(response => response.json())
                .then(json => {
                    resolve(json)
                })
                .catch(error => console.log(error))
        })
    }).then(json => {
        for (let i = 0; i < json.cards.length; i++) {
            mCards[i] = json.cards[i]
        }
        addToHand(mPlayer, 2)
        addToHand(mHouse, 2)
        updateTableCards(mPlayer, false)
        updateTableCards(mHouse, false)
        updatePoints(false)
        showButton("#hit-button")
        showButton("#stay-button")
        showButton("#double-button")

    }).then(() => {
        if (mHouse.cards[1].value === "ACE") {
            showButton("#insurance-button")
        }
        if (mPlayer.cards[0].value === mPlayer.cards[1].value) {
            showButton("#split-button")
        }
    }).then(() => {
        /*if (mPlayer.cards[0].value !== mPlayer.cards[1].value) {
            resetBlackjack()
            playBlackjack()
        }*/
    })
}

function addToHand(player, numberOfCards) {
    for (let i = 0; i < numberOfCards; i++) {
        //Set points for player
        let card = mCards.pop()
        if (checkPoints(card) !== "ACE") {
            player.points.ace11 += checkPoints(card)
            player.points.ace1 += checkPoints(card)
            player.points.final += checkPoints(card)
            if (i > 0 && player.name === "house") {
                player.points.hiddenAce11 += checkPoints(card)
                player.points.hiddenAce1 += checkPoints(card)
            }
        } else {
            player.points.ace1 += 1
            player.points.ace11 += 11
            if (i > 0 && player.name === "house") {
                player.points.hiddenAce1 += 1
                player.points.hiddenAce11 += 11
            }
        }
        player.cards.push(card)
    }
}

function checkPoints(card) {
    //Returns value of card unless ace, then returns ace as string
    if (card.value === "JACK" || card.value === "QUEEN" || card.value === "KING") {
        return 10
    } else if (card.value === "ACE") {
        return "ACE"
    } else {
        return parseInt(card.value)
    }
}

function updateTableCards(player, houseTurn) {
    let id = "#" + player.name + "-hand"

    let handElement = document.querySelector(id)
    handElement.innerText = ""
    for (let i = 0; i < player.cards.length; i++) {
        let img = document.createElement("img")
        img.className = "card"
        if (i === 0 && player.name === "house" && !houseTurn) {
            img.src = "img/cards/purple_back.png"
        } else {
            img.src = "img/cards/" + player.cards[i].code + ".png"
        }
        handElement.appendChild(img)
    }
}

function updatePoints(isHouseTurn) {
    //Set points on the table, if ace is in play both possibilities shown
    let playerPoints = document.querySelector("#player-points")
    let housePoints = document.querySelector("#house-points")
    if (isAceInHand(mPlayer)) {
        playerPoints.innerText = mPlayer.points.ace1 + " / " + mPlayer.points.ace11
    } else {
        playerPoints.innerText = mPlayer.points.ace11
    }

    if (!isHouseTurn) {
        if (isAceInHand(mHouse)) {
            housePoints.innerText = mHouse.points.hiddenAce1 + " / " + mHouse.points.hiddenAce11
        } else {
            housePoints.innerText = mHouse.points.hiddenAce11
        }
    } else {
        if (isAceInHand(mHouse)) {
            housePoints.innerText = mHouse.points.ace1 + " / " + mHouse.points.ace11
        } else {
            housePoints.innerText = mHouse.points.ace11
        }
    }
}

function isAceInHand(player) {
    //Checks whether an ace is in a player's hand
    for (let i = 0; i < player.cards.length; i++) {
        let card = player.cards[i]
        if (card.value === "ACE") {
            if (player.cards.length === 2 && i === 0 && player.name === "house") {

            } else {
                return true
            }
        }
    }
    return false
}

function resetBlackjack() {
    mCards = []
    mPlayer = {
        name: "player",
        cards: [],
        points: {
            ace1: 0,
            ace11: 0,
            final: 0
        }
    }
    mHouse = {
        name: "house",
        cards: [],
        points: {
            ace1: 0,
            ace11: 0,
            hiddenAce1: 0,
            hiddenAce11: 0,
            final: 0
        }
    }
    document.querySelector("#player-hand").innerText = ""
    document.querySelector("#house-hand").innerText = ""
    updatePoints(false)
}

function hit() {
    let promise = new Promise(resolve => {
        addToHand(mPlayer, 1)
        updateTableCards(mPlayer, false)
        updatePoints(false)
        setTimeout(resolve, 100)
    })

    promise.then(() => {
        if (mPlayer.points.ace1 > 21) {
            lost()
        }
    })
}

function hitSplit() {
    let promise = new Promise(resolve => {
        addToHand(mPlayerSplit, 1)
        updateTableCards(mPlayerSplit, false)
        updatePoints(false)
        setTimeout(resolve, 100)
    })

    promise.then(() => {
        if (mPlayerSplit.points.ace1 > 21) {
            lostSplit()
        }
    })
}

function stay(doubled) {
    updateTableCards(mHouse, true)
    updatePoints(true)

    if (mInsured && mHouse.cards[0].value === "10") {
        console.log("INSURANCE WON")
        incrementMoney(betAmount * 1.5)
        mInsured = false
        window.alert()
    }

    while (mHouse.points.ace1 < 17 || mHouse.points.ace11 < 17 && mHouse.points.ace1 < mPlayer.points.ace1) {
        addToHand(mHouse, 1)
        updateTableCards(mHouse, true)
        updatePoints(true)
    }

    if (mPlayer.points.ace11 > 21) {
        mPlayer.points.final = mPlayer.points.ace1
    } else {
        mPlayer.points.final = mPlayer.points.ace11
    }

    if (mHouse.points.ace11 > 21) {
        mHouse.points.final = mHouse.points.ace1
    } else {
        mHouse.points.final = mHouse.points.ace11
    }

    if (mPlayer.points.final > mHouse.points.final) {
        victory()
        if (doubled) {
            victory()
        }
    } else if (mHouse.points.final > 21) {
        victory()
        if (doubled) {
            victory()
        }
    } else if (mPlayer.points.final === mHouse.points.final) {
        tie()
    } else {
        lost()
    }
    showButton("#reset-button")
    updatePlayerMoney()
}

function staySplit() {
    updateTableCards(mHouse, true)
    updatePoints(true)

    while (mHouse.points.ace1 < 17 || mHouse.points.ace11 < 17 && mHouse.points.ace1 < mPlayerSplit.points.ace1) {
        addToHand(mHouse, 1)
        updateTableCards(mHouse, true)
        updatePoints(true)
    }

    if (mPlayerSplit.points.ace11 > 21) {
        mPlayerSplit.points.final = mPlayerSplit.points.ace1
    } else {
        mPlayerSplit.points.final = mPlayerSplit.points.ace11
    }

    if (mHouse.points.ace11 > 21) {
        mHouse.points.final = mHouse.points.ace1
    } else {
        mHouse.points.final = mHouse.points.ace11
    }

    if (mPlayerSplit.points.final > mHouse.points.final) {
        victorySplit()
    } else if (mPlayerSplit.points.final === mHouse.points.final) {
        tieSplit()
    } else {
        lostSplit()
    }
    updatePlayerMoney()
}

function double() {
    decrementMoney(betAmount)
    let promise = new Promise(resolve => {
        addToHand(mPlayer, 1)
        updateTableCards(mPlayer, false)
        updatePoints(false)
        setTimeout(resolve, 100)
    })

    promise.then(() => {
        if (mPlayer.points.ace1 > 21) {
            lost()
        } else {
            stay(true)
        }
    })
}

function insurance() {
    decrementMoney(betAmount / 2)
    mInsured = true
    hideButton("#insurance-button")
}

function split() {
    decrementMoney(betAmount)
    hideButton("#split-button")
    showButton("#hit-button-split")
    showButton("#stay-button-split")
    let splitCard = mPlayer.cards.pop()
    if (splitCard.value === "ACE") {
        mPlayer.points.ace1 -= 1
        mPlayer.points.ace11 -= 11

        mPlayerSplit.points.ace1 += 1
        mPlayerSplit.points.ace11 += 11
    } else {
        mPlayer.points.ace1 -= checkPoints(splitCard)
        mPlayer.points.ace11 -= checkPoints(splitCard)

        mPlayerSplit.points.ace1 += checkPoints(splitCard)
        mPlayerSplit.points.ace11 += checkPoints(splitCard)
    }
    mPlayerSplit.cards.push(splitCard)
    updateTableCards(mPlayer,false)
    updateTableCards(mPlayerSplit,false)
    updatePoints(false)
}

function decrementMoney(amount) {
    db.collection("users").doc(firebase.auth().currentUser.uid).update(
        "money", firebase.firestore.FieldValue.increment(amount * -1))
}

function incrementMoney(amount) {
    db.collection("users").doc(firebase.auth().currentUser.uid).update(
        "money", firebase.firestore.FieldValue.increment(amount * 1))
}

function showButton(id) {
    document.querySelector(id).setAttribute("class", "")
}

function hideButton(id) {
    document.querySelector(id).setAttribute("class", "hidden")
}









