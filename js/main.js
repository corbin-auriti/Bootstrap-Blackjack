
var currentGame = {
    deck: [],
    players: []
};

function shuffleDeck(numDecks = 1) {
    
    var suites = ["spades", "clubs", "diamonds", "hearts"];
    var values = ["ace", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "jack", "queen", "king"];
    
    currentGame.deck = [];
    
    for(n=0; n<numDecks; n++) {
        $.each(suites, function(i, suite) {
            $.each(values, function(i, value){

                if(value == "ace") {
                    currentGame.deck.push({
                        class: "card " + suite + " " + value,
                        value: [ 1, 10 ]
                    });
                } else {
                    currentGame.deck.push({
                        class: "card " + suite + " " + value,
                        value: [ ((i + 1 > 10) ? 10 : i + 1) ]
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

function addCardToStack(cardStackZone) {
    
}

function addPlayer(player) {
    
    currentGame.players.push(player);
    renderPlayers();
}

function renderPlayers() {
    
    $("#player-zones").empty();
    
    var numPlayers = currentGame.players.length;
    
    $.each(currentGame.players, function(i, player) {
        
        if(i == 0 && numPlayers * 3 < )
    });
}

function newGame() {
    
}

$(document).ready(function() {
    
    shuffleDeck();
});