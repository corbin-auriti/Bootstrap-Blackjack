
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
                        value: 1,
                        facedown: 0
                    });
                } else {
                    currentGame.deck.push({
                        class: "card " + suite + " " + value,
                        values: [ ((i + 1 > 10) ? 10 : i + 1) ],
                        value: ((i + 1 > 10) ? 10 : i + 1),
                        facedown: 0
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

function dealCardToPlayer(player) {

    var card = currentGame.deck.pop();
    card.facedown = false;
    
    player.hand.push(card);
    
    renderPlayer(player);
}

function dealCardToDealer() {

    var card = currentGame.deck.pop();
    
    if($("#dealer-card-zone .card").length > 0) {
        card.facedown = false;
    } else {
        card.facedown = true;
    }
    
    currentGame.dealerHand.push(card);
    
    renderDealer();
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

    $("<div id='player" + player.id + "' class='" + className + " player-zone'><div class='container-fluid'><div class='row'><div class='col-xs-12 card-stack-zone stack-up'></div></div><div class='row'><div class='col-xs-12'><h2 class='text-center player-name'></h2><h2 class='text-center'><span class='current-points'>0</span> <small>pts</small></h2><h4 class='text-center value'></h4></div></div></div></div>").appendTo("#player-zones");
    
    renderPlayer(player);
}

function renderPlayer(player) {

    $("#player" + player.id + " .player-name").html(player.name);

    var currentPts = 0;

    $("#player" + player.id + ".card-stack-zone").empty();
    
    var x = 10;
    var y = 10;
    
    $.each(player.hand, function(i, card) {
        
        currentPts += card.value;
        
        if($("#player" + player.id + " .card-stack-zone").hasClass("stack-down")) {
            $("<div class='" + ((card.facedown) ? "card face-down" : ("card " + card.class)) + "' style='top: " + y + "px; left: " + x + "px;'" + "></div>").appendTo("#player" + player.id + " .card-stack-zone");
        } else {
            $("<div class='" + ((card.facedown) ? "card face-down" : ("card " + card.class)) + "' style='bottom: " + y + "px; left: " + x + "px;'" + "></div>").appendTo("#player" + player.id + " .card-stack-zone");;
        }
              
        x += 20;
        y += 20;
    });

    $("#player" + player.id + " .current-points").html(currentPts);
}

function renderDealer() {

    $("#dealer-card-zone").empty();
    
    var x = 10;
    var y = 10;
    
    var currentPts = 0;
    
    $.each(currentGame.dealerHand, function(i, card) {
        
        if(card.facedown == false) {
            currentPts += card.value;
        }
        
        $("<div class='" + ((card.facedown) ? "card face-down" : ("card " + card.class)) + "' style='top: " + y + "px; left: " + x + "px;'" + "></div>").appendTo("#dealer-card-zone");            
              
        x += 20;
        y += 20;
    });

    $("#dealer-current-points").html(currentPts);
}

// Reset current game and create a new game with the newly loaded players and game settings
function newGame() {
    
    $("#new-game-modal").modal({
        backdrop: 'static',
        keyboard: false,
        show: true
    });
}

function addPlayerRow() {
    
    var rows = $("#new-game-players-tbody > tr").length;
    
    rows += 1;
    
    $("#new-game-players-tbody").append("<tr id='player-row-" + rows + "'><td><input type='hidden' class='player-number' value='" + rows + "' /><input type='text' maxlength='10' class='form-control player-name' value='Player " + rows + "' /></td><td><input type='number' class='form-control player-money' value='100' /></td><td><button class='btn btn-danger' style='font-style: bold;' onclick='removePlayerRow(\"#player-row-" + rows + "\")'>X</button></td></tr>");
    
    if(rows >= 4) {
        $("#new-game-add-player-button").attr("disabled", "disabled");
    }
}

function removePlayerRow(id) {
    
    $(id).remove();
    
    var rows = $("#new-game-players-tbody > tr").length;
    
    if(rows < 4) {
        $("#new-game-add-player-button").prop("disabled", false);
    }
}

function onStartGame() {

    $("#new-game-modal").modal('hide');
    
    var background = $("#new-game-background-select").val();
    
    var numDecks = $("#new-game-num-decks").val();
    
    currentGame = {
        deck: [],
        players: [],
        deckIndex: 0,
        dealerHand: [],
        settings: {
            background: background,
            numberOfDecks: numDecks
        },
        env: {
            firstRender: 1
        }
    };

    $("#new-game-players-tbody > tr").each(function(i, elem) {
        
        var id = $(elem).find("input.player-number").val();
        var name = $(elem).find("input.player-name").val();
        var value = $(elem).find("input.player-money").val();
        
        var player = {
            id: id,
            name: name,
            value: value,
            hand: [],
            hits: 0,
            busts: 0,
            hands: 0
        };
        
        currentGame.players.push(player);
    });
    
    shuffleDeck(currentGame.settings.numberOfDecks);
    
    renderPlayers();
    
    $.each(currentGame.players, function(i, player) {
        
        dealCardToPlayer(player);
    });
    
    dealCardToDealer();
    
    $.each(currentGame.players, function(i, player) {
        
        dealCardToPlayer(player);
    });
    
    dealCardToDealer();
}

// Initialize the page
$(document).ready(function() {
    
    newGame();
});