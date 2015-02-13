/**
 * Created by D on 10/29/2014.
 */

//***EVENT HANDLER SECTION***
//will uniformly handle events across different browsers. All credit for EventUtil function is due to Nicholas Zakas,
    //from his book, "Professional JavaScript for Web Developers"
var EventUtil = {
    addHandler: function(element, type, handler) {
        if (element.addEventListener) {
            element.addEventListener(type, handler, false);
        } else if (element.attachEvent) {
            element.attachEvent("on" + type, handler);
        } else {
            element["on" + type] = handler;
        }
    },
    removeHandler: function(element, type, handler) {
        if (element.addEventListener) {
            element.addEventListener(type, handler, false);
        } else if (element.attachEvent) {
            element.attachEvent("on" + type, handler);
        } else {
            element["on" + type] = handler;
        }
    },
    getEvent: function(event) {
        return event ? event : window.event;
    },
    getTarget: function(event) {
        return event.target || event.srcElement;
    },
    getCharCode: function(event) {
        if (typeof event.charCode == "number"){
            return event.charCode;
        } else {
            return event.keyCode;
        }
    },
    preventDefault: function(event){
        if(event.preventDefault){
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
    }
};

//this will be the event handler function to determine which element has been clicked and to call the appropriate
//method.  done in this fashion to improve performance
var clickHandler = function(event) {
    event = EventUtil.getEvent(event); //standardizes event
    var target = EventUtil.getTarget(event); //standardizes target

    //matches the target's id to an html element's id and runs the appropriate blackjack method
    switch(target.id){
        //deals new hand
        case "one_more_hand_button":
            document.getElementById("one_more_hand_button").style.visibility = "hidden";
            players1.dealGame();
            break;
        case "stand_button":
            players1.stand();
            break;
        case "hit_button":
            players1.hit();
            break;
        case "double_down_button":
            players1.doubleDown();
            break;
        case "wager_amt":
            target.select();
            break;
        //this will only run the player's first hand and deal a new hand and scrolls to bottom of the page
        case "start_button":
            document.getElementById("start_button").style.visibility = "hidden";
            players1.dealGame();
            window.scrollTo(0,document.body.scrollHeight);
            break;
    }
};

//this handler controls what the user can enter in the wager text box
var wagerHandler = function(event){
    event = EventUtil.getEvent();
    var target = EventUtil.getTarget(event); //standardizes target
    var charCode = EventUtil.getCharCode(event);

    //if 1. is not a # and 2. is not a special character(like backspace) and 3. is not the control key...
    //it will not run.  Only want #s or pasted inputted
    if(!/\d/.test(String.fromCharCode(charCode)) && charCode > 9 && !event.ctrlKey) {
        EventUtil.preventDefault(event); //prevents text from being entered
    }
};


//***THIS IS THE SECTION THAT WILL DEAL WITH CARDS AND THE DECK***
//number of decks the dealer will use
var deckCount = 4; //this can be changed to allow user to pick # of decks if desired

//this will return a deck object with all methods of a deck.  inside the deck object is a card object which has all
//necessary attributes about the card obj
var multiDeck = (function() {

    //card constructor
    function Card(cardId, suit) { //card constructor 0=2, 12=Ace. suit: 0=diamond, 1=club, 2=heart, 3=spade.
        //cardId and suit will be used to assign images to cards
        //convert cardId into blackjack value.
        var nonAceCards = (cardId < 8) ? cardId + 2 : 10;
        this.value = (cardId === 12) ? 11 : nonAceCards;
        this.cardImgSrc = ""; //this will direct to the associated card image

        //makes the cardId and suit into an easier to use format
        var fixCardNames = function () {

            switch(cardId) {
                case 9:
                    cardId = "jack";
                    break;
                case 10:
                    cardId = "queen";
                    break;
                case 11:
                    cardId = "king";
                    break;
                case 12:
                    cardId = "ace";
                    break;
            }

            if (cardId < 9) {
                cardId += 2; //makes a two (which had value of 0 previously) into a two and so on
            }

            switch(suit) {
                case 0:
                    suit = "diamonds";
                    break;
                case 1:
                    suit = "clubs";
                    break;
                case 2:
                    suit = "hearts";
                    break;
                case 3:
                    suit = "spades";
                    break;
            }
        };
        fixCardNames();
        //creates the img src
        this.cardImgSrc = "img/" + cardId + "_of_" + suit + ".jpg";
    }

    //Create a 1D single/multiple deck array which is a collection of card objects 52 per deckCount
    var oneDeck = (function createDeck() {
        var theDeck = [];
        for (var i =0; i < deckCount; i++) { //if more than one deck this loop will iterate and create x decks
            for (var j = 0; j < 13; j++) { //creates one deck of 52 cards
                for (var k = 0; k < 4; k++) {
                    theDeck[theDeck.length] = new Card(j, k);
                }
            }
        }
        return theDeck;
    })();

    //SuperDeck constructor.  +Should hold decks as a 1D array. +Shuffle deck. +Count remaining cards.
    // +Remove cards from deck to discard array. +Deal. +Add discard cards to original deck when down to a certain
    //number of cards. +Reshuffle deck (don't need to repeat this method).
    function SuperDeck(masterDeck){ //masterDeck is the cards in the deck
        //generates dealer card supply
        var discardPile = []; //empty array for dealt cards

        //shuffles the masterDeck
        var shuffleCards = function() {
            masterDeck.sort(function(a, b){ return 0.5-Math.random(); }); //randomizes the sort
        };
        shuffleCards(); //shuffles cards when deck is constructed

        //this function removes x cards from masterDeck and returns them.  It also updates the discardPile and will
        //add the discardPile back to the masterDeck
        this.dealt = function dealt(numCards){
            var dealtCards = []; //will reset dealtCards each time dealt is called.  these are cards to be dealt this turn
            var poppedCards = ""; //string that holds one popped cards and is then reset on every for loop iteration

            //places cards in dealtCards and returns them. Also keeps track of discard pile and if the masterDeck0 is
            //more than 75% finished, it adds discardPile back in and reshuffles
            for (var i=0; i < numCards; i++) {
                poppedCards = masterDeck.pop();
                dealtCards[dealtCards.length] = poppedCards; //adds to dealt cards pile
                discardPile[discardPile.length] = poppedCards; //adds to discard pile to keep track of dealt
                poppedCards = ""; //resets poppedCards
            }
            //if deck is below 25% of initial cards we need to reshuffle old cards into masterDeck
            if (masterDeck.length / (masterDeck.length + discardPile.length) <= 0.25) {
                masterDeck = masterDeck.concat(discardPile); //makes new deck
                shuffleCards(); //now new deck is shuffled and ready to go
            }

            return dealtCards; //gives someone x cards in an array
        };
    }

    return new SuperDeck(oneDeck); //returns the deck object
})();

//***THIS SECTION DEALS WITH THE ACTUAL BJ GAME BETWEEN PLAYER AND DEALER***
//this will control both the dealer and the player
function Players() {

    //these 1D arrays hold the player and dealer cards for current turn
    var playerCards = [], dealerCards = [];

    //player chipCount element/chip count
    var chipCountElement = document.getElementById("chip_count");
    var chipCount = 1000; //player starting chip count
    chipCountElement.value = chipCount;

    //wager element/wager
    var wagerElement = document.getElementById("wager_amt");
    var wagerAmt = 0;
    var initialWager; //this will keep track of opening bet

    //dealerCardElement and playerCardElement are the divs that hold the card images
    var dealerCardElement = document.getElementById("dealer_card_images");
    var playerCardElement = document.getElementById("player_card_images");

    var actionButtons = document.getElementsByClassName("action_buttons"); //buttons user can press on turn
    var hideButtons = function() { //hides buttons that player can interact with during turn
        for (var i = 0; i < actionButtons.length; i++) {
            actionButtons[i].style.visibility = "hidden";
        }
    };

    var showButtons = function() { //shows buttons that player can interact with during turn
        for (var i = 0; i < actionButtons.length; i++) {
            actionButtons[i].style.visibility = "visible";
        }
        //hide double-down button if player does not have enough chips to make the bet
        if(chipCount - wagerAmt < 0) {
            actionButtons[2].style.visibility ="hidden";
        }
    };

    //this moves the cards to the left if the card is not the first card dealt
    function moveLeft(cardElement){
        if (cardElement.parentNode.childNodes[0] !== cardElement) {
            cardElement.style.marginLeft = "-55px";
        }
    }

    //displays the card except if bool is passed in as true in which case it displays the backCard
    function addDealerCardImg(card, bool){
        var img = document.createElement("img");
        if (bool) {
            img.src = "img/cardBack.jpg";
        }
        else {
            img.src = card.cardImgSrc;
        }
        img.style.height = "100%";
        dealerCardElement.appendChild(img);
        moveLeft(img);
    }

    //takes the card object and from its cardImgSrc property it adds the card to the browser in the player's pile
    function addPlayerCardImg(card){
        var img = document.createElement("img");
        img.src = card.cardImgSrc;
        img.style.height = "100%"; //100% of container
        playerCardElement.appendChild(img);
        moveLeft(img);
    }

    function uncoverDealerCard(){
        //removes second
        dealerCardElement.removeChild(dealerCardElement.lastChild);
        addDealerCardImg(dealerCards[1]);
    }
    //this function will count the total score of the player/dealer cards
    var myCount = function (playerNameCards) { //card score counting function
        var score = 0;
        //check every card in playerNameCards
        for (var i = 0; i < playerNameCards.length; i++){
            score += playerNameCards[i].value; //playerNameCards must be a 1D array for this to work
        }
        // this block will properly adjust score to account for aces which can have a 1 or 11 value
        if (score > 21 && aceCount(playerNameCards) > 0) {
            score = score - ((aceCount(playerNameCards) - 1) * 10); //makes all but one ace's value === 1
            if (score > 21) { //if the score is still greater than 21, change last ace's value from 11 to 1
                score = score - 10;
            }
        }
        return score;
    };

    //returns the number of aces in the handArray.  vital to myCount success
    var aceCount = function(deckArray){
        var aces = 0;//number of aces, value to be returned
        for (var i = 0; i < deckArray.length; i++) {
            if (deckArray[i].value === 11) {
                aces += 1;
            }
        }
        return aces;
    };

    //takes an array from multiDeck() and returns just the card object
    var giveOneCard = function() {
        //deal one card (in an array) and return that card object
        return multiDeck.dealt(1)[0];
    };

    //deals one card to dealer,
    var dealDealer = function() {
        var dealtCard = giveOneCard(); //get card from deck
        dealerCards.push(dealtCard); //add card to dealer's hand
        addDealerCardImg(dealtCard); //add card img to webpage
        updateDealerScore(); //update dealerScore
    };

    var dealPlayer = function() {
        var dealtCard = giveOneCard(); //get card from deck
        playerCards.push(dealtCard); //add card to player's hand
        addPlayerCardImg(dealtCard); //add card img to webpage
        updatePlayerScore(); //update player's score
    };

    //gives player cards that are in the form of an array and adds card imgs to browser
    //if only two parameters used then use dealer and only display first card
    var giveHand = function(userEmptyHand, newCardsArray, user) {
        for (var i = 0; i < newCardsArray.length; i++) {
            userEmptyHand.push(newCardsArray[i]);
            if (user === "player") {
                addPlayerCardImg(newCardsArray[i]);
            }
            else {
                addDealerCardImg(newCardsArray[0]);
                addDealerCardImg(newCardsArray[1], true); //will show back of card
                userEmptyHand.push(newCardsArray[1]); // required because loop will not iterate again
                break;
            }
        }
    };

    //these functions will update the webpage to show result of user interaction in game
    //change what is displayed in the textboxes
    var updatePlayerScore = function() {
        document.getElementById("user_score").value = myCount(playerCards);
    };
    var updateDealerScore = function() {
        document.getElementById("dealer_score").value = myCount(dealerCards);
    };

    //change #user_result based on win, tie, loss scenarios
    var updatePlayerWin = function() {
        document.getElementById("user_result").style.background = "green";
        document.getElementById("user_result").value = "You Win " + wagerAmt;
        chipCount += (wagerAmt * 2);
        chipCountElement.value = chipCount;
    };
    var updatePlayerLoss = function() {
        document.getElementById("user_result").style.background = "red";
        document.getElementById("user_result").value = "You Lose " + wagerAmt;
    };
    var updatePlayerPush = function() {
        document.getElementById("user_result").style.background = "lightgrey";
        document.getElementById("user_result").value = "Push " + (wagerAmt) + " returned";
        chipCount += Number(wagerAmt);
        chipCountElement.value = chipCount;
    };
    var updatePlayerBlackjack = function() {
        document.getElementById("user_result").style.background = "green";
        document.getElementById("user_result").value = "BlackJack! Win " + (wagerAmt * 1.5);
        chipCount += (wagerAmt * 2.5);
        chipCountElement.value = chipCount;
    };

    //compares the dealer/player scores and determines the winner.  Then rewards winner.
    var scoreAnalyzer = function () {
        var playerScore = myCount(playerCards), dealerScore = myCount(dealerCards);

        //player busts
        if (playerScore > 21) {
            updatePlayerLoss();
        }
        //dealer busts
        else if (dealerScore > 21) {
            updatePlayerWin();
        }
        //tie score: push
        else if (dealerScore === playerScore) {
            updatePlayerPush();
        }
        //player has blackjack
        else if (playerScore === 21 && playerCards.length === 2) {
            updatePlayerBlackjack();
        }
        //player has higher score
        else if (dealerScore < playerScore) {
            updatePlayerWin();
        }
        //dealer has higher score
        else {
            updatePlayerLoss();
        }
    };

    //****THIS IS THE STARTING POINT OF EVERY HAND!!!!!****
    //at the start of each new hand, function will deal two cards to both the player and the dealer and display these
    //card values.  After it will check the player then dealer for blackjack.  Finally it shows the buttons such as
    //"hit", "stand", etc. and determines if split should be visible
    this.dealGame = function() {
        wagerAmt = wagerElement.value; //set new wagerAmt
        //check that wager is not negative/zero and is a number
        if(isFinite(String(wagerAmt)) && (chipCount - wagerAmt >= 0) && Number(wagerAmt) + 0 > 0) {
            //reduce chipCount to account for wager amount and update visual representation
            chipCount = chipCount - wagerAmt;
            chipCountElement.value = chipCount;
            //lock wager text box
            wagerElement.disabled = true;
            //keep track of bet amount, so initial val at start of hand is that bet amount (prev: doubling broke this)
            initialWager = wagerAmt;
        }
        else if(chipCount - wagerAmt < 0) { //if player bet is more than they have
            wagerElement.style.background = "lightcoral";
            wagerElement.value = "Insufficient Chips";
            return; //exit this.dealGame function
        }
        else {
            wagerElement.style.background = "lightcoral";
            wagerElement.value = "Invalid Number";
            return; //exit this.dealGame function
        }

        //un-color player text box + reset result text box.  Also make sure wager box is starting color
        document.getElementById("user_result").style.background = "white";
        document.getElementById("user_result").value = "";
        wagerElement.style.background = "white";

        //delete previously dealt cards until div is empty
        while (dealerCardElement.childNodes.length > 0) {
            dealerCardElement.removeChild(dealerCardElement.childNodes[0]);
        }
        while (playerCardElement.childNodes.length > 0) {
            playerCardElement.removeChild(playerCardElement.childNodes[0]);
        }

        //deal first two cards
        var playerFirstCards = multiDeck.dealt(2);
        var dealerFirstCards = multiDeck.dealt(2);

        //add the two initial card arrays to playerCards/dealerCards as two seperate card objs to each person
        //adds the card images to the webpage
        giveHand(playerCards, playerFirstCards, "player");
        giveHand(dealerCards, dealerFirstCards);

        //show player/dealer scores
        var playerScore = myCount(playerCards);
        var dealerScore = myCount(dealerCards);
        updatePlayerScore(); //enters the player's score into the browser
        document.getElementById("dealer_score").value = dealerCards[0].value;//only shows first card value until dealer's turn

        //player blackjack checker
        if (playerScore === 21) {
            runDealer();
        }
        //dealer blackjack checker
        if (dealerScore === 21) {
            document.getElementById("dealer_score").value = myCount(dealerCards);
            runDealer();
        }

        //show buttons if neither the player or dealer have blackjack
        if (dealerScore !== 21 && playerScore !== 21) {
            //show user buttons if game active
            showButtons()
        }
    };

    //adds one card and determines if the player has busted/got 21/can still hit
    this.hit = function () {
        //gives player card, updates player score, adds card img to webpage
        dealPlayer();

        if (myCount(playerCards) >= 21) { //if have score of 21 or greater after the dealt card
            runDealer();
        }
        else {
            //hide doubleDown button
            document.getElementById("double_down_button").style.visibility = "hidden";
        }
    };

    //assign this to a stand button
    this.stand = function () {
        runDealer();
    };

    //similar to hit function except that the player can only recieve one card and then it's the dealer's turn
    this.doubleDown = function () {

        //adjust chipCount and wagerAmt for double down bet
        chipCount = chipCount - wagerAmt;
        wagerAmt = wagerAmt * 2;

        //update visual representation of chipCount/wagerAmt
        chipCountElement.value = chipCount;
        wagerElement.value = wagerAmt;

        //deals player card, updates player score, and adds card img to webpage
        dealPlayer();
        //end player turn, run dealer
        runDealer();

    };

    //THIS RUNS WHEN THE PLAYER HAS FINISHED THEIR TURN
    //deals dealer remaining cards, figures out who won, rewards winner, empties player/dealer hands,
    // shows new deal button
    var runDealer = function(){  //this is the dealer's turn
        //hide all the unusable buttons
        hideButtons();

        //show hidden dealer card
        uncoverDealerCard();

        updateDealerScore();
        //checks to make sure player has not busted and that the player does not have blackjack
        if (myCount(playerCards) <= 21 && (myCount(playerCards) != 21 || playerCards.length > 2)) {
            //add cards until dealer has 17 or greater (probably want to add a delay/animation here
            while (myCount(dealerCards) < 17) {
                dealDealer();
            }
        }
        //compares dealer score vs player score, announces winner, and properly compensates winner
        scoreAnalyzer();

        //reset player/dealer cards + make start button visible + reactivates wager text box w/ initial wager
        dealerCards = [];
        playerCards = [];
        document.getElementById("one_more_hand_button").style.visibility = "visible";
        wagerElement.disabled = false;
        wagerElement.value = initialWager;
    };
}

//create the player/dealer
var players1 = new Players();
//adds the event handler to the body
EventUtil.addHandler(document.body, "click", clickHandler);
//add the event handler to prevent non numerical entries into wager textbox
EventUtil.addHandler(document.getElementById("wager_amt"), "keypress", wagerHandler);





//***start screen***
//should have a start button that creates the deck in the first instance(done)
//should create deck instance(done)
//should also allow the user to choose how many decks they want (min 2, max 8)


//***general gameplay***

//slidebar to count user bet per hand
//display showing hard and soft score (when have an ace)

//hit button, stand button, spilt button (when applicable), and doubledown button
//1. hit button should get a card, tally new score, if score 20 or lower wait for user action
//2. stand button should deactivate user buttons and count user_score as final as dealer self-deals
//3. split button should divide the two cards into two seperate hands, add an additional bet amount for second hand,
//   and play the first hand first and the second hand after.
//4. doubleDown button should get one more card, double the player bet, and tally the player score and disable all
//   other buttons until the next hand.


//***after hand***

//deactivate and hide hit, stand, split, and doubleDown buttons
//show button that asks if user would like to bet again (allow checkbox to auto-deal)


//***other ideas***
//leaderboards
//card-counting helper


