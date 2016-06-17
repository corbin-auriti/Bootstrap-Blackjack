
var modalNum = 1;

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
                        values: [ 1, 11 ],
                        value: 11,
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
    
    player.score = 0;
    
    var aceIndex = [];
    
    $.each(player.hand, function(i, card) {
        
        player.score += card.value;
        
        if(card.values.length > 1 && card.value == 11) {
            aceIndex.push(i);
        }
    });
    
    if(player.score == 21 && player.hand.length == 2) {
        
        player.blackjack = true;
    } else {
        
        while(player.score > 21) {
            if(aceIndex.length < 1) {
                player.busted = true;
                break;
            } else {
                player.hand[aceIndex.pop()].value = 1;
                player.score -= 10;
            }
        }
    }
    
    renderPlayer(player);
}

function dealCardToDealer() {

    var card = currentGame.deck.pop();
    
    if(currentGame.dealer.hand.length > 0) {
        card.facedown = false;
    } else {
        card.facedown = true;
    }
    
    currentGame.dealer.hand.push(card);
    
    currentGame.dealer.score = 0;
    
    var aceIndex = [];
    
    $.each(currentGame.dealer.hand, function(i, card) {
        
        if(card.facedown == false) {
            currentGame.dealer.score += card.value;
            
            if(card.values.length > 1 && card.value == 11) {
                aceIndex.push(i);
            }
        }
    });
    
    while(currentGame.dealer.score > 21) {
        if(aceIndex.length < 1) {
            currentGame.dealer.busted = true;
            break;
        } else {
            currentGame.dealer.hand[aceIndex.pop()].value = 1;
            currentGame.dealer.score -= 10;
        }
    }
    
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

    $("<div id='player" + player.id + "' class='" + className + " player-zone'><div class='container-fluid'><div class='row'><div class='col-xs-12 card-stack-zone stack-up'></div></div><div class='row'><div class='col-md-6'><h2 class='player-name'></h2><h2><span class='current-points'>0</span> <small>pts</small></h2><h4 class='text-center value'></h4></div><div class='col-md-6'><h3>Value: <span class='player-value'>0</span></h3><h3>Bet: <span class='player-bet'>0</span></h3></div></div><div class='row'><div class='col-xs-12'><button class='btn btn-primary btn-lg' style='margin-right: 20px;' onclick='playerHit()' disabled> Hit </button><button class='btn btn-info btn-lg' onclick='nextPlayer()' disabled>Stand</button></div></div></div></div>").appendTo("#player-zones");
    
    renderPlayer(player);
}

function renderPlayer(player) {

    $("#player" + player.id + " .player-name").html(player.name);
    
    $("#player" + player.id + " .player-value").html("$" + player.value.toFixed(0));
    
    $("#player" + player.id + " .player-bet").html("$" + player.currentBet.toFixed(0));
    
    $("#player" + player.id + " .card-stack-zone").empty();
    
    var x = 10;
    var y = 10;
    
    $.each(player.hand, function(i, card) {
        
        if($("#player" + player.id + " .card-stack-zone").hasClass("stack-down")) {
            $("<div class='" + ((card.facedown) ? "card face-down" : ("card " + card.class)) + "' style='top: " + y + "px; left: " + x + "px;'" + "></div>").appendTo("#player" + player.id + " .card-stack-zone");
        } else {
            $("<div class='" + ((card.facedown) ? "card face-down" : ("card " + card.class)) + "' style='bottom: " + y + "px; left: " + x + "px;'" + "></div>").appendTo("#player" + player.id + " .card-stack-zone");;
        }
              
        x += 20;
        y += 20;
    });

    $("#player" + player.id + " .current-points").html(player.score);
}

function renderDealer() {

    $("#dealer-card-zone").empty();
    
    var x = 10;
    var y = 10;
    
    $.each(currentGame.dealer.hand, function(i, card) {
        
        $("<div class='" + ((card.facedown) ? "card face-down" : ("card " + card.class)) + "' style='top: " + y + "px; left: " + x + "px;'" + "></div>").appendTo("#dealer-card-zone");            
              
        x += 20;
        y += 20;
    });

    $("#dealer-current-points").html(currentGame.dealer.score);
}

function playerHit() {
    
    var currentPlayer = currentGame.players[currentGame.playerIndex];
    
    dealCardToPlayer(currentPlayer);
    
    if(currentPlayer.busted == true || currentPlayer.score == 21) {
        nextPlayer();
    }
}

function nextPlayer() {
    
    currentGame.playerIndex++;
    
    $(".player-zone button").each(function(i, elem) {
        
        $(elem).prop("disabled", true);
    });
    
    if(currentGame.playerIndex < currentGame.players.length) {
        
        var player = currentGame.players[currentGame.playerIndex];
    
        if(player.blackjack == true || player.busted == true || player.value <= 0) {
            nextPlayer();
        } else {
            $("#player" + player.id + " button").each(function(i, elem) {

                $(elem).prop("disabled", false);
            });
        }
    } else {
        
        dealersTurn();
    }
}

function dealersTurn() {
    
    currentGame.dealer.hand[0].facedown = false;
    
    currentGame.dealer.score += currentGame.dealer.hand[0].value;
    
    if(currentGame.dealer.score == 21) {
        currentGame.dealer.blackjack = true;
    } else {
        while(currentGame.dealer.score < 17) {
            dealCardToDealer();
        }
    }
    
    renderDealer();
    
    $.each(currentGame.players, function(i, player) {
        if(player.busted == true || (player.score < currentGame.dealer.score && currentGame.dealer.busted == false) || (player.score == 21 && player.blackjack == false && currentGame.dealer.blackjack == true)) {
            player.value -= player.currentBet;
        } else if (player.blackjack == true) {
            if(currentGame.dealer.blackjack == false) {
                player.value += 1.5 * player.currentBet;
            }
        } else if (player.score > currentGame.dealer.score || (player.busted == false && currentGame.dealer.busted == true)) {
            player.value += player.currentBet;
        }
    });
    
    $("#show-results-wrapper").removeClass("hide");
}

function showResults() {
    
    $("#results-table-tbody").empty();
    
    $.each(currentGame.players, function(i, player) {
        
        var rowClass = "";
        var status = "";
        var earnings = "";
        
        if(player.busted == true) {
            rowClass = "danger";
            status = "Busted";
            earnings = "$" + (-1 * player.currentBet).toFixed(2);
        } else if (player.score < currentGame.dealer.score && currentGame.dealer.busted == false) {
            rowClass = "danger";
            status = "Lost";
            earnings = "$" + (-1 * player.currentBet).toFixed(2);
        } else if (player.blackjack == true) {
            if(currentGame.dealer.blackjack == true) {
                rowClass = "";
                status = "Tied";
                earnings = "$0.00";
            } else {
                rowClass = "success";
                status = "Blackjack";
                earnings = "$" + (1.5 * player.currentBet).toFixed(2);
            }
        } else if (player.score > currentGame.dealer.score || (player.busted == false && currentGame.dealer.busted == true)) {
            rowClass = "success";
            status = "Won";
            earnings = "$" + player.currentBet.toFixed(2);
        } else if (player.score == 21 && player.blackjack == false && currentGame.dealer.blackjack == true) {
            rowClass = "danger";
            status = "Lost";
            earnings = "$" + (-1 * player.currentBet).toFixed(2);
        } else if (player.score == currentGame.dealer.score && player.busted == false && currentGame.dealer.busted == false) {
            rowClass = "";
            status = "Tied";
            earnings = "$0.00";
        }
        
        $("<tr class='" + rowClass + "'><td>" + player.name + "</td><td>" + status + "</td><td>" + earnings + "</td></tr>").appendTo("#results-table-tbody");
        
        $("#results-modal").modal('show');
    });
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
    
    modalNum++;
    
    var rows = $("#new-game-players-tbody > tr").length;
    
    rows += 1;
    
    $("#new-game-players-tbody").append("<tr id='player-row-" + rows + "'><td><input type='hidden' class='player-number' value='" + modalNum + "' /><input type='text' maxlength='10' class='form-control player-name' value='Player " + modalNum + "' /></td><td><input type='number' class='form-control player-money' value='100' /></td><td><button class='btn btn-danger' style='font-style: bold;' onclick='removePlayerRow(\"#player-row-" + rows + "\")'>X</button></td></tr>");
    
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
        playerIndex: -1,
        dealer: {
            hand: [],
            score: 0,
            busted: false,
            blackjack: false
        },
        settings: {
            background: background,
            numberOfDecks: numDecks
        },
        env: {
            firstRender: 1
        }
    };

    $("body").css("background-image", "url('" + currentGame.settings.background + "')");
    
    $("#new-game-players-tbody > tr").each(function(i, elem) {
        
        var id = $(elem).find("input.player-number").val();
        var name = $(elem).find("input.player-name").val();
        var value = parseInt($(elem).find("input.player-money").val());
        
        var player = {
            id: id,
            name: name,
            value: value,
            currentBet: 10,
            hand: [],
            busted: false,
            blackjack: false,
            score: 0
        };
        
        currentGame.players.push(player);
    });
    
    placeBets();
}

function decreaseBet(id) {
    
    $.each(currentGame.players, function(i, player) {
        
        if(player.id == id) {
            
            if(player.currentBet - 5 >= 10) {
                player.currentBet -= 5;
                $("#player-bet-input-" + id).val(player.currentBet);
            }
        }
    });
}

function increaseBet(id) {
    
    $.each(currentGame.players, function(i, player) {
        
        if(player.id == id) {
            
            if(player.currentBet + 5 <= player.value) {
                player.currentBet += 5;
                $("#player-bet-input-" + id).val(player.currentBet);
            }
        }
    });
}

function placeBets() {
    
    $("#betting-tbody").empty();
    
    $.each(currentGame.players, function(i, player) {
        
        if(player.value < 10) {
            player.currentBet = player.value;
        } else {
            player.currentBet = 10;
        }
        
        $("<tr><td>" + player.name + "</td><td><button type='button' class='btn btn-default btn-sm col-xs-2' onclick='decreaseBet(" + player.id + ")'>-</button> <div class='col-xs-6 col-xs-offset-1'><input id='player-bet-input-" + player.id + "' class='form-control' type='number' size='3' maxlength='3' value='" + player.currentBet + "' readonly /></div><button class='btn btn-default btn-sm col-xs-2 col-xs-offset-1' type='button' onclick='increaseBet(" + player.id +")'>+</button></td></tr>").appendTo("#betting-tbody");
    });
    
    $("#betting-modal").modal({
        backdrop: 'static',
        keyboard: false,
        show: true
    });
}

function newHand() {
    
    $("#betting-modal").modal('hide');
    
    currentGame.playerIndex = -1;
    
    $("#show-results-wrapper").addClass("hide");
    
    shuffleDeck(currentGame.settings.numberOfDecks);
    
    renderPlayers();
    
    $.each(currentGame.players, function(i, player) {
        
        player.blackjack = false;
        player.busted = false;
        player.hand = [];
        player.score = 0;
        
        if(player.value > 0) {
            dealCardToPlayer(player);
        }
    });
    
    currentGame.dealer.blackjack = false;
    currentGame.dealer.busted = false;
    currentGame.dealer.hand = [];
    dealCardToDealer();
    
    $.each(currentGame.players, function(i, player) {
        
        if(player.value > 0) {
            dealCardToPlayer(player);
        } else {
            renderPlayer(player);
        }
    });
    
    dealCardToDealer();
    
    nextPlayer();
}

// Initialize the page
$(document).ready(function() {
    
    newGame();
});