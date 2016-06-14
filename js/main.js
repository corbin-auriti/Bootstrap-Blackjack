
var currentGame = {};

// Shuffles the deck, like casinos, deck can be shuffled with multiple decks to make counting cards more difficult
function shuffleDeck(numDecks = 1) {
    
    // The names of each suit and card value. Used for generating the appropriate CSS classes to render card faces
    var suites = ["spades", "clubs", "diamonds", "hearts"];
    var values = ["ace", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "jack", "queen", "king"];
    
    currentGame.deck = [];
    
    for(n=0; n<numDecks; n++) {
        $.each(suites, function(i, suite) {
            $.each(values, function(i, value){

                if(value == "ace") {
                    currentGame.deck.push({
                        class: "card " + suite + " " + value,
                        values: [ 1, 10 ],
                        value: 1
                    });
                } else {
                    currentGame.deck.push({
                        class: "card " + suite + " " + value,
                        values: [ ((i + 1 > 10) ? 10 : i + 1) ],
                        value: ((i + 1 > 10) ? 10 : i + 1)
                    });
                }
            });
        });
    }
    
    var i, j, obj;
    
    for(i = currentGame.deck.length; i; i -= 1) {
        j = Math.floor(Math.random() * i);
        obj = currentGame.deck[i - 1];
        currentGame.deck[i - 1] = currentGame.deck[j];
        currentGame.deck[j] = obj;
    }
}

function dealCardToPlayer(card, player) {

    player.hand.push(card);
}

// Render a new card to a card stack zone
function addCardToStack(card, cardStackZone) {
    

}

// Add a new player to the game
function addPlayer(player) {
    
    currentGame.players.push(player);
    
    renderPlayers();
}

function renderPlayers() {
    
    $("#player-zones").empty();
    
    var numPlayers = currentGame.players.length;
    
    $.each(currentGame.players, function(i, player) {
        if(currentGame.env.firstRender == 1) {
            if(numPlayers == 1) {
                addPlayerZone(player, "col-xs-4 col-xs-offset-4");
            } else if (numPlayers == 2) {
                addPlayerZone(player, "col-xs-3 col-xs-offset-2");
            } else if (numPlayers == 3) {
                addPlayerZone(player, "col-xs-3 col-xs-offset-1");
            } else if (numPlayers == 4) {
                addPlayerZone(player, "col-xs-3");
            }
        } else {
            renderPlayer(player);
        }
    });

    if(currentGame.env.firstRender == 1) {
        currentGame.env.firstRender == 0;
    }
}

function addPlayerZone(player, className) {

    $("<div id='" + player.id + "' class='" + className + " player-zone'><div class='container-fluid'><div class='row'><div class='col-xs-12 card-stack-zone stack-up'></div></div><div class='row'><div class='col-xs-12'><h2 class='text-center player-name'></h2><h2 class='text-center'><span class='current-points'>0</span> <small>pts</small></h2><h4> class='text-center value'></h4></div></div></div></div>").appendTo("#player-zones");
}

function renderPlayer(player) {

    $(player.id + " .player-name").html(player.name);

    var currentPts = 0;

    $.each(player.hand, function(i, card) {
        
        currentPts += card.value;
    });

    $(player.id + " .current-points").html(currentPts);
}

// Reset current game and create a new game with the newly loaded players and game settings
function newGame() {
    
    currentGame = {
        deck: [],
        players: [],
        deckIndex: 0,
        settings: {
            background: "/img/background.jpg",
            numberOfDecks: 1
        },
        env: {
            firstRender: 1
        }
    };

    shuffleDeck(currentGame.settings.numberOfDecks);
}

// Initialize the page
$(document).ready(function() {
    
    shuffleDeck();
});