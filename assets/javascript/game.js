let player = {
    role: "",
    key: "",
    currHand: []
}

let pTestArray = [{
    pname: "p1",
    currSelection: "a",
    voteSelection: null,
    role: "storyTeller"
}, {
    pname: "p2",
    currSelection: 2,
    voteSelection: "a",
    role: "player"
}, {
    pname: "p3",
    currSelection: 3,
    voteSelection: "a",
    role: "player"
}, {
    pname: "p4",
    currSelection: 4,
    voteSelection: "a",
    role: "player"
}, {
    pname: "p5",
    currSelection: 5,
    voteSelection: "a",
    role: "player"
}, {
    pname: "p6",
    currSelection: 6,
    voteSelection: "a",
    role: "player"
}, ]

let database = firebase.database();

//will hold the shuffled deck which will decrease as cards are dealt
let cardRef = database.ref("/cards");

//will hold users as they connect the site
let userRef = database.ref("/users");
let connectedRef = database.ref(".info/connected");

//will hold all card related information
let gameRef = database.ref("/game")

//holds players hands
let playerHandRef = database.ref("/player_hand")

let cards = {
    oDeck: [],
    sDeck: [],
    createDeck: function() {
        let array = [];

        for (i = 1; i < 99; i++) {
            if (i < 10) {

                array.push("card_0000" + i);

                // array.push($.cloudinary.image('card_0000' + i + '.jpg', { width: 200, height: 300, crop: 'fill' }));
            } else {

                array.push("card_000" + i);

                //array.push($.cloudinary.image('card_000' + i + '.jpg', { width: 200, height: 300, crop: 'fill' }));
            }
        }
        this.oDeck = array;
        return array;
    },

    // Using the Fisher-Yates shuffle
    shuffleDeck: function(array) {
        let i = 0;
        let j = 0;
        let temp = null;
        let tArray = $.extend(true, [], array);
        // console.log("this is before the for loop");

        for (i = tArray.length - 1; i > 0; i -= 1) {
            j = Math.floor(Math.random() * (i + 1));
            temp = tArray[i];
            tArray[i] = tArray[j];
            tArray[j] = temp;

            // console.log("this is inside the for loop ", i, j)
        }
        // this.sDeck = tArray;
        cardRef.set(tArray);
        return tArray;
    },

    displaySpecificCard: function(div, array, pos) {
        $(div).append($.cloudinary.image(array[pos] + '.jpg', { width: 100, height: 150, crop: 'fill' }));
    },

    testCards: function(div, array) {
        $(div).empty();
        for (let i = 0; i < 98; i++) {
            $(div).append($.cloudinary.image(array[i] + '.jpg', { width: 200, height: 300, crop: 'fill' }));
        }
    }
}

let game = {
    cardsCountedArray: [],
    stateArray: [
        0 //initial state
        , 1 //game start initial cards dealt story teller choose card
        , 2 //story teller to tell story display story to everyone
        , 3 //player card selection
        , 4 //player voting
        , 5 //player scoring
        , 6 //round ended
    ],
    currState: 0,
    //roles and players stored here.
    startGame: function() {
        this.startGameAssignRoles();
        cards.createDeck();
        cards.shuffleDeck(cards.oDeck);
        this.checkAndDeal(cards.sDeck, 6);
    },
    startGameAssignRoles: function() {
        userRef.orderByChild("dateAdded").once("value").then(function(snap) {
            let usersArray = snap.val();
            console.log(usersArray);
            let userArrayKeys = Object.keys(usersArray);
            console.log(userArrayKeys);
            // let gamePlayers = []

            // userRef.child(userArrayKeys[0]).update({
            //     role: "storyTeller"
            // });

            for (i = 0; i < userArrayKeys.length; i++) {
                if (i === 0) {
                    userRef.child(userArrayKeys[i]).update({
                            role: "storyTeller"
                        })
                        // gamePlayers.push({name:userArrayKeys[i], role:"storyTeller"})
                        // gamePlayers[userArrayKeys[i]] = "storyTeller"
                    gameRef.update({ curr_teller: userArrayKeys[i] });
                } else {
                    userRef.child(userArrayKeys[i]).update({
                            role: "player"
                        })
                        // gamePlayers.push({name:userArrayKeys[i], role:"Player"})
                        // gamePlayers[userArrayKeys[i]] = "player"
                }
            }

            // gameRef.update({gamePlayers});
        })
    },

    scoring: function() {


        // // counting instances of an object
        // let cardsSelected = pTestArray.map(function(item) {
        //     return item.voteSelection
        // });
        // // console.log("these are the cards selected", cardsSelected);
        // let countedCards = cardsSelected.reduce(function(allCards, card) {
        //     if (card in allCards) {
        //         allCards[card]++;
        //     } else {
        //         allCards[card] = 1;
        //     }
        //     return allCards;
        // }, {});
        // // console.log("this is CountedName", countedCards);
        // this.cardsCountedArray = countedCards;

        // let posStoryTeller = pTestArray.map(function(e) {
        //     return e.role
        // }).indexOf("storyTeller");

        // console.log("this is the position of the story teller", posStoryTeller);

    },

    dealingHand: function(deckArray, nCards) {
        let hand = [];

        for (let i = 0; i < nCards; i++) {
            hand.push(deckArray[0]);
            deckArray.splice(0, 1);
        }

        cardRef.set(deckArray);

        // player.currHand = player.currHand.concat(hand);

        return hand;
    },

    checkAndDeal: function(deckArray, nCards) {
        userRef.once("value").then(function(snap) {
            let keysArray = Object.keys(snap.val());

            keysArray.forEach(function(key) {
                // if (playerHandRef.child(key).exists()) {
                //     cardsNeeded = playerHandRef.child(key).once("value", function(snap) {
                //         currCards = snap.val().length
                //         nCards = nCards - currCards;
                //     })
                //     let currHand = game.dealingHand(deckArray, cardsNeeded);
                //     playerHandRef.update({
                //         [key]: currHand
                //     })
                // } else {
                //     let currHand = game.dealingHand(deckArray, nCards);
                //     playerHandRef.update({
                //         [key]: currHand
                //     })
                // }
                let currHand = game.dealingHand(deckArray, nCards);
                playerHandRef.update({
                    [key]: currHand
                });
            })
            gameRef.update({
                currState: 1
            });
        })
    },
};

//on user connection add them to the db
connectedRef.on("value", function(snap) {
    if (snap.val()) {
        var key = userRef.push({
            dateAdded: firebase.database.ServerValue.TIMESTAMP
        }).key;

        userRef.child(key).update({
            key: key
        })

        player.key = key;
        userRef.child(key).onDisconnect().remove();
        playerHandRef.child(key).onDisconnect().remove();
    }
});


//automatically start game when three players have joined. This will be assigned to enable the start button in the final game.
userRef.once("value", function(snap) {
    numPlayers = snap.numChildren();

    console.log("numPlayers:", numPlayers);

    if (numPlayers > 3) {
        console.log("inside the start listener if statement");
        game.startGame();
    }

})

//insures everyone has the latest shuffled deck locally. Updated as cards are dealt out.
cardRef.on("value", function(snap) {
    cards.sDeck = snap.val();
});

//assigns user role to local reference
userRef.on("value", function(snap) {
    let keysArray = Object.keys(snap.val());

    for (var i = keysArray.length - 1; i >= 0; i--) {
        if (player.key === keysArray[i]) {
            player.role = snap.child(keysArray[i]).val().role
        }
    }
});

//addd cards to player board.

// playerHandRef.on("value",function(snap) {
//     let keysArray = Object.keys(snap.val());
//     let playerHand =[];

//     for (let i = keysArray.length - 1; i >= 0; i--) {
//         if (player.key === keysArray[i]) {
//             playerHand = snap.child(keysArray[i]).val()
//             console.log("inside the if loop for the player ref hand deal", playerHand)
//             return;
//         }
//     }

//     for (let i = playerHand.length - 1; i >= 0; i--) {
//         let cardDiv = $("#dealt-card-container").append($("<div>",{"id":"card"+[i]}));
//         cards.displaySpecificCard(cardDiv, playerHand, i);
//         console.log(playerHand[i]);
//     }
// })
