# README
## Summary
This is a two player game, where each player takes turn trying to guess the opponents selected character.

## Use Cases
1. Login
   The user should navigate to the game page, and a user token should be found. If the user does not have a token, then we should create a new one that allows the user to be uniquely identified
1. Start new game
   The user should be able to start a new game from the home page. This allows them to start a random game with an opponent selected by the server.
  1. Users that start the new game will be allowed to choose their character first
  1. Users that start the game will not be the first to ask questions.
1. See list of ongoing games
   The user should see a list on the home page that displays a list of games that are ongoing. Ongoing games are defined as games that have not been completed, and require either the current user, or the opponent to make a move.
1. User selects a game for which it is the opponent's turn
   The user selects a game for which they are waiting for the opponent to either guess or ask a question. The user can see a list of questions they have asked, and a list of questions answered. The user can also see the state of the board, and can modify their board if they are reviewing the questions they've asked. They cannot ask a new question, or guess who they think will be the opponents character while it is the opponent's turn.
1. User selects a game for which it is their turn
  1. The user does not have a selected character yet, so they select a character, look at the board, and ask the first question of the match. They cannot attempt to guess the opponents character. Once the user asks a question, their turn has ended.
  1. The user has to answer a question from the opponent. They can see a list of previous questions asked by the opponent, but must answer the question before they can move on. Once the user has answered the question, they can
    1. Ask a question themselves. Once they have asked the question, their turn has ended. 
    1. Attempt to guess the opponents character based on their questions. There are two possible outcomes:
      1. The user guesses right. This ends the game. The user is shown statistics about the current game and about games versus this opponent.
      1. The user guesses wrong. This ends the current user's turn. The user is not allowed to ask further questions.
  1. The user sees that the opponent has tried to guess the user's character. This has two outcomes:
    1. The opponent has guessed right. This means the game is over, and the user has the choice to either start a new game, or end further games with the current user.
    1. The opponent has guessed wrong. This means that the game continues, and the current user can proceed to either guess, or ask questions of their own.

## TODOs
* Design the Login page
* Design the Home page with game select and start buttons
* Design the 'ask question' page
* Design the 'answer question' page
* Design the select character page
* Design the guess character page
* Design the guess wrong page
* Design the guess right page
* Design the 'opponent guessed right' page
* Design the 'opponent guessed wrong' page
* Design the 'game over' page

## User Stories
* The user can start a new game
* The user can see a list of on-going games

## Reminders
* What happens if a user attempts to cheat by changing the URL to skip a stage. We need to have a game engine on the server that checks whether or not we're transitioning to the right states from the client (i.e. don't allow a client to guess before they've answered their opponent. Don't let them guess twice, etc..)
* Make sure the back button also sets the UI to its "new state" given that the user just performed an action.

## URLS
/login
/games
/myturn
  /myturn/pick
  /myturn/answer
  /myturn/ask
    /myturn/ask/question
    /myturn/ask/guess
/theirturn

# GAME SCHEMA
  {
    "players":[
      {
        id: "52728ca9954deb0b31000004",
        actions:[],
        selected_character: "djfsjfhsdjhfsjhfds"
        board:[
          {"_id":"5286e01d8b587b0000000001","up":true},
          {"_id":"5286e01d8b587b0000000002","up":true},
          {"_id":"5286e01d8b587b0000000003","up":true},
          {"_id":"5286e01d8b587b0000000004","up":true}        
        ]
      }
      "52728fbf63a64c904c657ed5"
    ],
    "turn":"52728ca9954deb0b31000004",
    "_id":"5286e01d9beb41000000001c",
    "board":"kfsjfkdsgjjsfghjkfdhgjkd"
  }