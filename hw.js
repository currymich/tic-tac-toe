// General Assembly, WDI (Web Development Immersive) Remote, Cohort 04 (Matey)
// Copyright (C) 2016 Matt Brendzel under the GNU General Public License.
// See LICENSE for details.

"use strict";

// Contains variables and functions related to behind the scenes operation
const GameEngine = {
  board: Array(9).fill(null),
    /// e.g. ["X", "O", "X", null, null, null, null, null, null]
  currentPlayer: "X",
  gameOver: false,
  ai: false,
  winsX: 0,
  winsO: 0,
  moveNumber: 1,
  lastMove: [],

  /* Resets all tiles on the game board, clears the previous message (player wins or draw), clears game over and if playing against computer and it's computer's turn, initializes computer play */
  resetGame: function(){
    this.board = Array(9).fill(null);
    ViewEngine.resetBoard();
    ViewEngine.clearFlash();
    this.gameOver = false;
    this.moveNumber = 1;
    this.lastMove = [];

    if(GameEngine.ai == true && GameEngine.currentPlayer == 'O'){
      GameEngine.aiMove();
    }
  },

  /* Toggles current player in game engine (which decides what letter to place on click). Calls view engine to change the "current player" display and then if it's AI's turn and AI is on, triggers AI move
  [used by GameEngine.makeMove] */
  toggleCurrentPlayer: function(){
    if(this.currentPlayer == "X"){
      this.currentPlayer = "O"
    } else {
      this.currentPlayer = "X"
    }

    ViewEngine.togglePlayer(this.currentPlayer);
    this.moveNumber++

    if(GameEngine.ai == true && GameEngine.currentPlayer == 'O'){
      GameEngine.aiMove();
    }
  },

  /* check if position clicked already has a value if yes, return false if no, return true [used in Controller.onClick and GameEngine.aiMove] */
  isValidMove: function(position){
    if(this.board[position] == null && this.gameOver == false){
      return true;
    } else {
      return false;
    }
  },

  /* Goes through each possible win condition:
  True if - three in a row found (that isn't 3 nulls)
  Null if - all spots taken, no 3 in a row
  False if - no 3 in a row and spots still available

  in case of a win, also adds 'win' class to each tile involved in that win to add that team's glow color to the tile */
  checkForVictory: function(){
    var victoryChecks = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (var i = 0; i < victoryChecks.length; i++){
      if(this.board[victoryChecks[i][0]] == this.board[victoryChecks[i][1]] && this.board[victoryChecks[i][1]] == this.board[victoryChecks[i][2]] &&
      this.board[victoryChecks[i][2]] != null){
        $(`[data-position="${victoryChecks[i][0]}"]`).addClass('Win');
        $(`[data-position="${victoryChecks[i][1]}"]`).addClass('Win');
        $(`[data-position="${victoryChecks[i][2]}"]`).addClass('Win');
        $('aside').css('display','none')
        return true;
      }
    }
    if(!GameEngine.board.includes(null)){
      return null;
    }
    return false;
  },

  /* Very similar to the controller.onclick, calling make move with the position decided by GameEngine.aiDecide instead of position clicked by player. Since aiDecide's random move doesn't check if its move is valid, sometimes it can choose invalid spots in which case it will run again to pick a new random spot, console message 'bad move' is generated in this case */
  aiMove: function(){
    if(GameEngine.gameOver == false){
      var move = GameEngine.aiDecide();
      if(GameEngine.isValidMove(move)){
        window.setTimeout(function(){GameEngine.makeMove(move)}, 400);
      } else {
        GameEngine.aiMove();
      }
    }
  },

  /* uses the same win conditions from checkForVictory, giving each 3 in a row set a value - negative if there are player chosen spots, positive if there are computer chosen spots. The array of checks is printed to console and The value is then used in one of 3 cases to decide AI's next move in order of priority (using isValidMove to make sure it picks the right one of the 3 spots when placing its move):

  3-in-a-rows with value of +2 signal that there are already 2/3 spots filled with O and a third will win:
   places O in third spot, generates console message "offense"

  3-in-a-rows with value of -2 signal that there are 2/3 spots filled with X and AI needs to block:
    places O in third spot, generates console message "defense"

  3-in-a-rows with value of 0, -1, or 1 either already have been blocked (X-O-X) or only have one spot taken (X-null-null) (ie no threat of loss/chance of win) and are ignored:
    Generate random move (checked in aiMove), console message: "random" */
  aiDecide: function(){

    //OLD DECISION LOGIC BELOW

    var victoryChecks = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    var bestMove = Array(9).fill(0);

    for(var i = 0; i < victoryChecks.length; i++){
      for (var j = 0; j < victoryChecks[i].length; j++){
        if(this.board[victoryChecks[i][j]] == 'X'){
          bestMove[i]--;
        } else if(this.board[victoryChecks[i][j]] == 'O'){
          bestMove[i]++;
        }
      }
    }

    for(var i = 0; i < bestMove.length; i++){
      if (bestMove[i] == 2){
        if(GameEngine.isValidMove(victoryChecks[i][0])){
          return victoryChecks[i][0];
        } else if (GameEngine.isValidMove(victoryChecks[i][1])){
          return victoryChecks[i][1];
        } else {
          return victoryChecks[i][2];
        }
      }
    }

    for(var i = 0; i < bestMove.length; i++){
        if (bestMove[i] == -2){
         if(GameEngine.isValidMove(victoryChecks[i][0])){
           return victoryChecks[i][0];
         } else if (GameEngine.isValidMove(victoryChecks[i][1])){
           return victoryChecks[i][1];
         } else {
           return victoryChecks[i][2];
         }
       }
     }

    //END OLD DECISION LOGIC

    var randomMove = Math.floor(Math.random()*9);

    switch (this.moveNumber) {
      case 1:
        return 0;
        break;
      case 2:
        if (this.lastMove[0] == 4) {
          return 0;
        } else {
          return 4;
        }
        break;
      case 3:
        switch (this.lastMove[0]) {
          case 1:
          case 2:
          case 5:
          case 8:
            return 6;
            break;
          case 3:
          case 7:
            return 2;
            break;
          case 4:
          case 6:
            return 8;
            break;
        }
        break;
      case 4:
        return randomMove;
        break;
      case 5:
        switch (this.lastMove[0]) {
          case 1:
          case 3:
          case 5:
          case 7:
            return 4;
            break;
          case 2:
            return 8;
            break;
          case 6:
          case 8:
            return 2;
            break;
        }
        break;
      default:
        return randomMove;
        break;
    }
  },


  /* Used by aiMove and GameController.onClickBoardSpace to place a move on the board. With each call, updates the board variable, then the tile with that new text value, then the style of the tile for coloring purpose. After each move, checkForVictory is called:

  if win detected (true) - ends game to prevent additional clicks, puts win message up, increments the tally of wins, and leaves current player to start next game (winner starts)

  if draw detected (null) - ends game, puts draw message up, doesn't increment tally, and changes current player so other player can starts

  if neither detected, just changes player */
  makeMove: function(position){
    this.board[position] = this.currentPlayer;
    ViewEngine.updateTileText(position);
    ViewEngine.updateTileStyle(position);

    if(GameEngine.ai == true && GameEngine.currentPlayer == 'X'){
      this.lastMove.push(parseInt(position))
    }

    switch (GameEngine.checkForVictory()) {
      case true:
        GameEngine.gameOver = true;
        ViewEngine.flashMessage('win');
        GameEngine.incrementTally();
        break;
      case null:
        GameEngine.gameOver = true;
        ViewEngine.flashMessage('draw');
        GameEngine.toggleCurrentPlayer();
        break;
      default:
        GameEngine.toggleCurrentPlayer();
    }
  },

  /* Called by makeMove, when win detected increments win count for current player then calls update function to update it on screen */
  incrementTally: function(){
    if(GameEngine.currentPlayer == "X"){
      GameEngine.winsX++;
    } else {
      GameEngine.winsO++;
    }
    ViewEngine.updateTally()
  }
};

// UI - everything involved with changing or updating what the user sees
const ViewEngine = {

  /* clears letters and victory glow from each space, shows the board and the current player and tally (board is hidden on page refresh and side info is hidden on page refresh and after each win)*/
  resetBoard: function(){
    $('#board > div').html('');
    $('#board > div').attr('class', '')
    $('.board').css('display', 'block')
    $('aside').css('display', 'block')
  },

  /* Updates the 'current player' display after each turn */
  togglePlayer: function(player){
    $('.currentPlayer span').attr('class',`${player}`).html(`${player}`)
  },

  /* Updates the win tally display after each win */
  updateTally: function(){
    $('.scoreTally').html(`<span class="X">X</span><hr><h2>${GameEngine.winsX}</h2>
    <span class="O">O</span><hr><h2>${GameEngine.winsO}</h2>`)
  },

  /* Flashes a message (either win or draw) after each game, using span to add color to the X or O in the case of a win message */
  flashMessage: function(msg){
    if(msg == 'win'){
      $('#flash-msg').html(`Player <span>${GameEngine.currentPlayer}</span> has won!`)
      if(GameEngine.currentPlayer == "X"){
        $('#flash-msg span').attr('class', 'X')
      } else {
        $('#flash-msg span').attr('class', 'O')
      }
    } else if (msg == 'draw') {
      $('#flash-msg').html(`This match is a draw!`)
    }
  },

  /* clears out the message after new game is pressed */
  clearFlash: function(){
    $('#flash-msg').html('')
  },

  // http://stackoverflow.com/questions/2487747/selecting-element-by-data-attribute
  /* When space is clicked (or chosen by AI), updates text in that position with whatever was placed in the board array */
  updateTileText: function(position){
    $(`*[data-position=${position}]`).html(`${GameEngine.board[position]}`)
  },

  /* When space is clicked (or chosen by AI), updates style in that position so colors work correctly for the letters */
  updateTileStyle: function(position){
    if(`${GameEngine.board[position]}` == "X"){
      $(`*[data-position=${position}]`).attr('class', 'X')
    } else if (`${GameEngine.board[position]}` == "O"){
      $(`*[data-position=${position}]`).attr('class', 'O')
    }
  }

};

/* Reads button and board clicks from user and uses game engine to modify game state and view engine to update displayed values */
const GameController = {
  //starts new game with AI off
  onClickNewGame: function(event){
    GameEngine.ai = false;
    GameEngine.resetGame()
  },

  //starts new game with AI on
  onClickAIGame: function(event){
    GameEngine.ai = true;
    GameEngine.resetGame();
  },

  //checks if user clicked space is valid and adds X to that position
  onClickBoardSpace: function(event){
    var boxClicked = event.target.dataset.position;
    if(GameEngine.isValidMove(boxClicked)){
      GameEngine.makeMove(boxClicked);
    }
  }
};

//Connects buttons and board positions to respective actions in GameController
window.onload = function(){
  $('#two_player').click(function(){GameController.onClickNewGame(event)})
  $('#AI').click(function(){GameController.onClickAIGame(event)})
  $('#board div').click(function(){GameController.onClickBoardSpace(event)})
};
