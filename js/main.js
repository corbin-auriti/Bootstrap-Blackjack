// Global variable the increments each time a new player is created during the game session
var modalNum = 1;

// Globally accessible variable used to store current game information. 
// The variable is initialized / reinitialized in the onStartGame() function
var currentGame = {};

// Shuffles the deck, like casinos, deck can be shuffled with multiple decks to make counting cards more difficult
function shuffleDeck(numDecks = 1) {
    
    // The names of each suit and card value. Used for generating the appropriate CSS classes to render card faces
    var suites = ["spades", "clubs", "diamonds", "hearts"];
    var values = ["ace", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "jack", "queen", "king"];
    
    currentGame.deck = [];
    
    // This is a triple nested for loop to populate the deck array with everycard.
    // Technically, this is O(n^3) which is TERRIBLE, but the number of iterations maxes out at 5 * 52 (260 iterations)
    // (The most decks you can have in one game shuffled together is 5)
    for(n=0; n<numDecks; n++) {
        $.each(suites, function(i, suite) {
            $.each(values, function(i, value){

                // The ace can have two values, 1 or 11
                // Originally, the values array was going to be used to store potential values
                // However, in final implementation, the values array for the card is simply used
                // to detect if the card is an ace (values.length > 1)
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
    
    // Actual shuffle algorithm. Very simple and straightforward, but gets the job done in O(n)
    for(i = currentGame.deck.length; i; i -= 1) {
        j = Math.floor(Math.random() * i);
        obj = currentGame.deck[i - 1];
        currentGame.deck[i - 1] = currentGame.deck[j];
        currentGame.deck[j] = obj;
    }
}

/*
 * This functions "deals" a card to a player. It simply pops a card off of the game deck "stack" and pushes it to the player hand "stack"
 */
function dealCardToPlayer(player) {

    // Take a card from the top of the deck
    var card = currentGame.deck.pop();
    
    // Player's cards are NEVER delt facedown
    card.facedown = false;
    
    // Add the card to the player's hand
    player.hand.push(card);
    
    player.score = 0;
    
    // Ace index is used to find any aces in the player's hand
    // If there are aces, their default value is 11, but must be reduced to 1
    // if the player's score exceeds 21
    var aceIndex = [];
    
    // Iterate over the hand to compute the player's score
    $.each(player.hand, function(i, card) {
        
        player.score += card.value;
        
        // If the card is an ace, add it to the ace index
        if(card.values.length > 1 && card.value == 11) {
            aceIndex.push(i);
        }
    });
    
    // Check for blackjack
    if(player.score == 21 && player.hand.length == 2) {
        
        player.blackjack = true;
    } else {
        
        // If the player's score is over 21, keep flipping ace cards' values to 1 from 11
        // Until the score is less than 21
        while(player.score > 21) {
            
            // If there are no aces left to flip to 1, the player has busted
            if(aceIndex.length < 1) {
                player.busted = true;
                break;
            } else {
                // Found an ace with a value of 11. Set it to 1 and remove its index from the ace index array
                player.hand[aceIndex.pop()].value = 1;
                player.score -= 10;
            }
        }
    }
    
    // Lastly, render the new changes to this player's part of the view
    renderPlayer(player);
}

/*
 * Similar function to dealCardToPlayer, but for the dealer, which follows slightly different rules
 * See dealCardToPlayer() for more details
 */
function dealCardToDealer() {

    // Take card from top of deck
    var card = currentGame.deck.pop();
    
    // IF this is the first card delt to the dealer, it goes facedown until the end of the hand
    if(currentGame.dealer.hand.length > 0) {
        card.facedown = false;
    } else {
        card.facedown = true;
    }
    
    // Add the card to the dealer's hand
    currentGame.dealer.hand.push(card);
    
    currentGame.dealer.score = 0;
    
    // See documentation for the aceIndex system in dealCardToPlayer() function
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
    
    // Render the changes to the dealer's place on the page
    renderDealer();
}

/*
 * Grab all game statistics for all players saved in local storage
 * See the showStats() function for more details
 */
function getAllUserData() {

    var users = getUsersList();

    var allUserStats = [];

    $.each(users, function(i, user) {

        var userObj = getUserStats(user);

        if(userObj != null) {
            
            allUserStats.push(userObj);
        }
    });

    return allUserStats;
}

/*
 * Grab all game statistics for a single user saved in local storage
 *
 * Parameters:
 * user - The name of the user to grab statistics of
 */
function getUserStats(user) {

    var userStatsStr = localStorage.getItem(user);

    if(userStatsStr != null) {
        return JSON.parse(userStatsStr);
    } else {
        return null;
    }
}

/*
 * Get a list of all user names whose statistics are saved in local storage
 * See getAllUserData() for more details
 */
function getUsersList() {

    if(Storage != "undefined") {

        var usersStr = localStorage.getItem("users-list");
        
        var users = [];

        if(usersStr != null) {
            users = JSON.parse(usersStr);
        }

        return users;
    } else {
        return [];
    }
}

/*
 * Add a new user to the master list of all saved users in local storage
 * Silently does nothing if user name is already saved
 * See addUserStats() for more details
 */
function addUserToList(user) {

    if(Storage != "undefined") {

        var users = getUsersList();

        if(users.indexOf(user) < 0) {

            users.push(user);

            localStorage.setItem("users-list", JSON.stringify(users));
        }
    }
}

/*
 * Add stats from a single hand of a player to local storage
 * If the player is already saved in local storage, the stats are aggregated into the existing data
 * otherwise the player is saved with these stats as the initial data
 *
 * Parameters:
 * user - The name of the user
 * earnings - The amount of money gained / lost in the hand
 * win - 1 if hand was won, 0 if not
 * loss - 1 if hand was lost, 0 if not
 * tie - 1 if hand was tie, 0 if not
 */
function addUserStats(user, earnings, win, loss, tie) {

    if(Storage != "undefined") {

        var users = getUsersList();

        // Initial data provided from parameters
        var userObj = {
            name: user,
            wins: win,
            losses: loss,
            ties: tie,
            total: 1,
            earningsSum: earnings,
            earningsAvg: earnings
        };

        // Check if user already saved in local storage
        if(users.indexOf(user) >= 0) {
            
            var userObjTemp = getUserStats(user);

            // If user data is not corrupted / doesn't exist, aggregate new stats with existing
            if(userObjTemp != null) {

                userObj = userObjTemp;

                userObj.earningsSum += earnings;
                userObj.total++;
                userObj.wins += win;
                userObj.losses += loss;
                userObj.ties += tie;
                userObj.earningsAvg = userObj.earningsSum / userObj.total;
            }
        // If user doesn't exist in local storage, add it to the master list
        } else {

            addUserToList(user);
        }

        // Save the user object back to local storage with changes
        localStorage.setItem(user, JSON.stringify(userObj));
    }
}

/*
 * A call to render all of the players on the web page
 * If the call is being made for the first time, creates and initializes the HTML needed on the page for each player
 */
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

/*
 * Creates the necessary HTML for a single player on the web page and then renders the player information to it
 */
function addPlayerZone(player, className) {

    $("<div id='player" + player.id + "' class='" + className + " player-zone'><div class='container-fluid'><div class='row'><div class='col-xs-12 card-stack-zone stack-up'></div></div><div class='row'><div class='col-md-6'><h2 class='player-name'></h2><h2><span class='current-points'>0</span> <small>pts</small></h2><h4 class='text-center value'></h4></div><div class='col-md-6'><h3>Value: <span class='player-value'>0</span></h3><h3>Bet: <span class='player-bet'>0</span></h3></div></div><div class='row'><div class='col-xs-12'><button class='btn btn-primary btn-lg' style='margin-right: 20px;' onclick='playerHit()' disabled> Hit </button><button class='btn btn-info btn-lg' onclick='nextPlayer()' disabled>Stand</button></div></div></div></div>").appendTo("#player-zones");
    
    renderPlayer(player);
}

/*
 * Render the information of a single player in the game to their respective HTML
 *
 * Parameters:
 * player - The player object to render
 */
function renderPlayer(player) {

    // Set the name
    $("#player" + player.id + " .player-name").html(player.name);
    
    // Set the current amount of money the player has
    $("#player" + player.id + " .player-value").html("$" + player.value.toFixed(0));
    
    // Set the current bet amount of the player
    $("#player" + player.id + " .player-bet").html("$" + player.currentBet.toFixed(0));
    
    // Remove all cards rendered on the player's zone
    $("#player" + player.id + " .card-stack-zone").empty();
    
    var x = 10;
    var y = 10;
    
    // For each card in the player's hand, render it into a stack on the page
    $.each(player.hand, function(i, card) {
        
        if($("#player" + player.id + " .card-stack-zone").hasClass("stack-down")) {
            $("<div class='" + ((card.facedown) ? "card face-down" : ("card " + card.class)) + "' style='top: " + y + "px; left: " + x + "px;'" + "></div>").appendTo("#player" + player.id + " .card-stack-zone");
        } else {
            $("<div class='" + ((card.facedown) ? "card face-down" : ("card " + card.class)) + "' style='bottom: " + y + "px; left: " + x + "px;'" + "></div>").appendTo("#player" + player.id + " .card-stack-zone");;
        }
              
        x += 20;
        y += 20;
    });

    // Set the player's current hand value
    $("#player" + player.id + " .current-points").html(player.score);
}

/*
 * Renders the dealer's information to the web page
 * Similar to renderPlayer() function
 */
function renderDealer() {

    // Remove any cards previously rendered
    $("#dealer-card-zone").empty();
    
    var x = 10;
    var y = 10;
    
    // Render each card in the dealer's hand 
    $.each(currentGame.dealer.hand, function(i, card) {
        
        $("<div class='" + ((card.facedown) ? "card face-down" : ("card " + card.class)) + "' style='top: " + y + "px; left: " + x + "px;'" + "></div>").appendTo("#dealer-card-zone");            
              
        x += 20;
        y += 20;
    });

    // Show dealer's face up hand value
    $("#dealer-current-points").html(currentGame.dealer.score);
}

/*
 * Called when the active player clicks their "hit" button (note all hit buttons trigger same function)
 * Deals the player a new card
 * See dealCardToPlayer(player) for more details
 */
function playerHit() {
    
    // Grab the active player based on game player index
    var currentPlayer = currentGame.players[currentGame.playerIndex];
    
    // Deal a card to the player
    dealCardToPlayer(currentPlayer);
    
    // If the player has busted or their score is 21, move on to the next player automatically
    if(currentPlayer.busted == true || currentPlayer.score == 21) {
        nextPlayer();
    }
}

/*
 * Called when it is time for the next player to make their move(s)
 * This can be called automatically from other functions, or from a player's "Stand" button
 * This function activates the new active player's button to allow them to hit or stand
 */
function nextPlayer() {
    
    currentGame.playerIndex++;
    
    // First, disable all hit and stand buttons for all players
    // (this is simpler than trying to keep track of which ones to disable)
    $(".player-zone button").each(function(i, elem) {
        
        $(elem).prop("disabled", true);
    });
    
    // Check if the player index hasn't gone past the last player
    if(currentGame.playerIndex < currentGame.players.length) {
        
        var player = currentGame.players[currentGame.playerIndex];
    
        // If the current active player has a BlackJack, or busted, or has no money, their turn is skipped
        if(player.blackjack == true || player.busted == true || player.value <= 0) {
            nextPlayer();
        } else {
            // Otherwise, enable the hit and stand buttons for the new active player
            $("#player" + player.id + " button").each(function(i, elem) {

                $(elem).prop("disabled", false);
            });
        }
    } else {
        // If the player index is past the last player, all players have gone and it is the dealer's turn
        dealersTurn();
    }
}

/*
 * This function is called after all players have had their turn.
 * The dealer hits until they reach 17 or greater, and the all wins / losses are calculated
 */
function dealersTurn() {
    
    // Flip over the facedown card
    currentGame.dealer.hand[0].facedown = false;
    
    // Add the facedown card's value to the dealer's current score
    currentGame.dealer.score += currentGame.dealer.hand[0].value;
    
    // Wbile the dealer hasn't busted or hit 21 and has a score less than 17, keep hitting
    if(currentGame.dealer.score == 21) {
        currentGame.dealer.blackjack = true;
    } else {
        while(currentGame.dealer.score < 17) {
            dealCardToDealer();
        }
    }
    
    // Render the final resulting hand of the dealer
    renderDealer();
    
    // Begin computing the wins and losses for each player based on the dealer's hand
    $.each(currentGame.players, function(i, player) {
        
        var win = 0, lose = 0, tie = 0, earnings = 0;
        
        // If the player busted, had a score less than the dealer, or got 21 not by blackjack when the dealer was dealt a blackjack, the player looses
        if(player.busted == true || (player.score < currentGame.dealer.score && currentGame.dealer.busted == false) || (player.score == 21 && player.blackjack == false && currentGame.dealer.blackjack == true)) {
            lose = 1;
            earnings = -1 * player.currentBet;
        // Blackjack for the player is either a tie (if the dealer got blackjack as well), or a 1.5x return on the bet
        } else if (player.blackjack == true) {
            if(currentGame.dealer.blackjack == false) {
                win = 1;
                earnings = 1.5 * player.currentBet;
            }
        // Finally, if the player's score is greater than the dealer's or the dealer busted and the player didn't, the players get 1x return on the bet
        } else if (player.score > currentGame.dealer.score || (player.busted == false && currentGame.dealer.busted == true)) {
            win = 1;
            earnings = player.currentBet;
        }
        
        // Add the bet earnings to the player's money amount (negative earnings for losing means less value)
        player.value += earnings;
        
        if(earnings == 0) {
            tie = 1;
        }
        
        // Save the stats for this round for the user to local storage
        // See showStats() for more details
        addUserStats(player.name, earnings, win, lose, tie);
    });
    
    $("#show-results-wrapper").removeClass("hide");
}

/*
 * Function to show the results from the previous hand
 * This function is called from the "Show Results" button after a round is over
 */
function showResults() {
    
    // Remove all existing results from the result table
    $("#results-table-tbody").empty();
    
    // For each player in the game, add their hand results to the results table
    $.each(currentGame.players, function(i, player) {
        
        var rowClass = "";
        var status = "";
        var earnings = "";
        
        // Based on the various win and lose conditions, color the table row and display the winnings / loss amounts and status from the hand
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
        
        // Add the row with the relevant hand data for the player to the results table
        // The data is player name, status (win, loss, busted, tied, or blackjack), and earnings (positive for win, negative for loss, 0 for tie)
        $("<tr class='" + rowClass + "'><td>" + player.name + "</td><td>" + status + "</td><td>" + earnings + "</td></tr>").appendTo("#results-table-tbody");
        
        // Show the results table modal
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

/*
 * Simple function call used to add a player to the players table in the Game Settings modal
 * See removePlayerRow() for more details
 */
function addPlayerRow() {
    
    // increment the unique player id number
    modalNum++;
    
    // Count the current number of player rows in the players table
    var rows = $("#new-game-players-tbody > tr").length;
    
    rows += 1;
    
    // Create the row on the table where users can specify the player name and starting money amount.
    // This HTML also creates a button to remove the player row from the table in the future if needed
    $("#new-game-players-tbody").append("<tr id='player-row-" + rows + "'><td><input type='hidden' class='player-number' value='" + modalNum + "' /><input type='text' maxlength='10' class='form-control player-name' value='Player " + modalNum + "' /></td><td><input type='number' class='form-control player-money' value='100' /></td><td><button class='btn btn-danger' style='font-style: bold;' onclick='removePlayerRow(\"#player-row-" + rows + "\")'>X</button></td></tr>");
    
    // If the new total number of players is 4 or greater, no new players can be created until one is removed
    if(rows >= 4) {
        $("#new-game-add-player-button").attr("disabled", "disabled");
    }
}

/*
 * Simple function call used to remove a player from the players table in the Game Settings modal
 * See addPlayerRow() for more details
 *
 * Parameters:
 * id - The id number of the player to remove
 */
function removePlayerRow(id) {
    
    $(id).remove();
    
    var rows = $("#new-game-players-tbody > tr").length;
    
    if(rows < 4) {
        $("#new-game-add-player-button").prop("disabled", false);
    }
}

/*
 * Function is called when the game settings modal is closed
 * Creates and initializes the game with all the settings selected from the modal
 */
function onStartGame() {

    // Close settings modal
    $("#new-game-modal").modal('hide');
    
    // Set background and number of decks based on selected options in the settings modal
    var background = $("#new-game-background-select").val();
    
    var numDecks = $("#new-game-num-decks").val();
    
    // initialize the current game global object variable
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

    // Change background to match settings
    $("body").css("background-image", "url('" + currentGame.settings.background + "')");
    
    // For each player created in the modal, create a new player object and add them to the current game object
    $("#new-game-players-tbody > tr").each(function(i, elem) {
        
        // Grab the player information from the fields in the players table on the settings modal
        var id = $(elem).find("input.player-number").val();
        var name = $(elem).find("input.player-name").val();
        var value = parseInt($(elem).find("input.player-money").val());
        
        // Initialize player object
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
    
    // Once the game has been created, the first hand can be dealt, which starts with players placing their bets
    placeBets();
}

/*
 * Function called by a button press on the betting modal. Used to decrease a player's bet before the hand is delt
 *
 * Parameters:
 * id - The id of the player whose bet is being decreased
 */
function decreaseBet(id) {
    
    // Using a foreach loop to find the player with the matching ID
    // Complexity is O(n), but since the maximum size for players is 4, it isn't an issue
    $.each(currentGame.players, function(i, player) {
        
        // Find player with matching id
        if(player.id == id) {
            
            // Player's bet can not be modified to go below 10 (unless the player has less than $10 left)
            if(player.currentBet - 5 >= 10) {
                player.currentBet -= 5;
                
                // Update the view on the modal to show new current betting amount for the player
                $("#player-bet-input-" + id).val(player.currentBet);
            }
            break;
        }
    });
}

/*
 * Function called by a button press on the betting modal. Used to increase a player's bet before the hand is delt
 *
 * Parameters:
 * id - The id of the player whose bet is being decreased
 */
function increaseBet(id) {
    
    // See comments in the decreaseBet() function regarding foreach loop
    $.each(currentGame.players, function(i, player) {
        
        if(player.id == id) {
            
            // Player can not bet more than they have
            if(player.currentBet + 5 <= player.value) {
                player.currentBet += 5;
                $("#player-bet-input-" + id).val(player.currentBet);
            }
            break;
        }
    });
}

/*
 * Function called to open the betting modal for the players
 * Allows players to place their bets before being delt their hand
 */
function placeBets() {
    
    // Empty the betting table's members
    // This is done because it is simpler than trying to detect when a new game has started.
    // The table is repopulated each time the modal is shown
    $("#betting-tbody").empty();
    
    // Foreach player currently playing, create a row on the table with the controls to modify the player's bet 
    $.each(currentGame.players, function(i, player) {
        
        // Set the initial player bet value (10 unless player has less than 10 left)
        if(player.value < 10) {
            player.currentBet = player.value;
        } else {
            player.currentBet = 10;
        }
        
        // Create the row to render on the table. each row contains the player's name, increase and decrease bet buttons, and a text box to display the current bet value
        // See the increaseBet() and decreaseBet() functions for more details
        $("<tr><td>" + player.name + "</td><td><button type='button' class='btn btn-default btn-sm col-xs-2' onclick='decreaseBet(" + player.id + ")'>-</button> <div class='col-xs-6 col-xs-offset-1'><input id='player-bet-input-" + player.id + "' class='form-control' type='number' size='3' maxlength='3' value='" + player.currentBet + "' readonly /></div><button class='btn btn-default btn-sm col-xs-2 col-xs-offset-1' type='button' onclick='increaseBet(" + player.id +")'>+</button></td></tr>").appendTo("#betting-tbody");
    });
    
    // Finally, we display the modal
    // Modal can only be escaped from an exit or hitting the "Play Hand" button
    $("#betting-modal").modal({
        backdrop: 'static',
        keyboard: false,
        show: true
    });
}

/*
 * Shows the statistics modal to display all game statistics for all players
 */
function showStats() {

    // Remove any existing data in the table
    $("#stats-table-tbody").empty();
    
    // Grab all of the saved user game stat data
    var userStats = getAllUserData();
    
    // For each saved user, display name, total hands played, wins, losses, ties, win percentage, and average earnings per hand
    $.each(userStats, function(i, user) {
        
        $("<tr><td>" + user.name + "</td><td>" + user.total + "</td><td>" + user.wins + "</td><td>" + user.losses + "</td><td>" + user.ties + "</td><td>" + (user.wins / user.total * 100).toFixed(0) + "%</td><td>$" + user.earningsAvg.toFixed(2) + "</td></tr>").appendTo("#stats-table-tbody")
    });
    
    $("#stats-modal").modal('show');
}

/*
 * Function when a new hand is delt in the same game
 * This function is called after bets are placed. See placeBets() for more details
 */
function newHand() {
    
    $("#betting-modal").modal('hide');
    
    // Reset the player turn index
    currentGame.playerIndex = -1;
    
    $("#show-results-wrapper").addClass("hide");
    
    // reshuffle the deck
    shuffleDeck(currentGame.settings.numberOfDecks);
    
    // Re-draw all of the players
    renderPlayers();
    
    // Deal each player one card, face-up & reset the player's stats for the hand
    $.each(currentGame.players, function(i, player) {
        
        player.blackjack = false;
        player.busted = false;
        player.hand = [];
        player.score = 0;
        
        if(player.value > 0) {
            dealCardToPlayer(player);
        }
    });
    
    // Reset the dealer and deal one card face-down
    currentGame.dealer.blackjack = false;
    currentGame.dealer.busted = false;
    currentGame.dealer.hand = [];
    dealCardToDealer();
    
    // Deal the second face up card for each player
    $.each(currentGame.players, function(i, player) {
        
        if(player.value > 0) {
            dealCardToPlayer(player);
        } else {
            renderPlayer(player);
        }
    });
    
    // Deal the dealer the second, face-up card
    dealCardToDealer();
    
    // Start the round with the first player
    nextPlayer();
}

// Initialize the page
$(document).ready(function() {
    
    newGame();
});