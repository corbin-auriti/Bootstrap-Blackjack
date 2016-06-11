
var deck = [];

function shuffleDeck(numDecks = 1) {
    
    var suites = ["spades", "clubs", "diamonds", "hearts"];
    var values = ["ace", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "jack", "queen", "king"];
    
    deck = [];
    
    for(n=0; n<numDecks; n++) {
        $.each(suites, function(i, suite) {
            $.each(values, function(i, value){

                if(value == "ace") {
                    deck.push({
                        class: "card " + suite + " " + value,
                        value: [ 1, 10 ]
                    });
                } else {
                    deck.push({
                        class: "card " + suite + " " + value,
                        value: [ ((i + 1 > 10) ? 10 : i + 1) ]
                    });
                }
            });
        });
    }
    
    var i, j, obj;
    
    for(i = deck.length; i; i -= 1) {
        j = Math.floor(Math.random() * i);
        obj = deck[i - 1];
        deck[i - 1] = deck[j];
        deck[j] = obj;
    }
}

$(document).ready(function() {
    
    shuffleDeck(5);
    
    $.each(deck, function(i, card) {
        
        $("<div>", {
            class: card.class
        }).appendTo("#main-content #house-zone");
    });
});