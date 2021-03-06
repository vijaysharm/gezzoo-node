# README.md
## Summary
This is a two player game, where each player takes turn trying to guess the opponents selected character.

## Use Cases
+ Login  
  + The user should navigate to the game page, and a user token should be found. If the user does not have a token, then we should create a new one that allows the user to be uniquely identified
+ Start new game
  + The user should be able to start a new game from the home page. This allows them to start a random game with an opponent selected by the server.  
  + Users that start the new game will be allowed to choose their character first
  + Users that start the game will **not** be the first to ask questions.
+ See list of ongoing games
  + The user should see a list on the home page that displays a list of games that are ongoing. Ongoing games are defined as games that have not been completed, and require either the current user, or the opponent to make a move.
+ User selects a game for which it is the opponent's turn
  + The user selects a game for which they are waiting for the opponent to either guess or ask a question. The user can see a list of questions they have asked, and a list of questions answered. The user can also see the state of the board, and can modify their board if they are reviewing the questions they've asked. They cannot ask a new question, or guess who they think will be the opponents character while it is the opponent's turn.
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

## Instaling
`brew install mongodb`  
`mongod`  
`npm install`  
`npm start`

##Tooling
+ git push heroku master
+ Going throught the heroku db `heroku addons:open mongolab`

Note that this project uses nodemon, and will restart automatically when a file is modified. This includes blowing away the contents of the db.

## TODOs
###Login

* Don't use userid as the token
* Support receiving an invalid/unknown token

###Impl

+ Better error handling
+ Store that a user guessed a character in the board.
+ Make sure that you can't skip your turn to reply by sending a guess/question action without replying first
+ Support not having a game with user X. Make sure that user never becomes an option for someone to play with again.
+ All the API that are not GETs should return the state the client should move to.
+ We should check if there is a game already in progress which isn't ended, and return that game if it exists otherwise, create a new game
+ Should auto-flip a guessed character

###UI

+ Check if pressing 'back' on the browser allows the state to be refreshed.
  + maybe forward to the right state if that's the case.
+ Add a 'user guessed x' type in the action screen
  + Make this item look better and add that they were wrong/right
+ Disable Submit button on action/reply screens
+ Have the API return you an object with localized strings.
  + You can also have different messages in the text box to make the experience a little more fun.
  + Have different strings displayed when the loser creates a new game with the opponent.
+ Take out all the hardcoded placeit images for avatars and replace them with something from the server
+ Download all the images from imdb and save them on your server. Be a good internet citizen.
+ Make dialog boxes look better
+ Validate the state of the game. If the state says 'reply', and the user enters the URL for 'board'. forward them to the right page.
+ Unset the controller selection for character select and board
+ Clicking an image again should hide the controls
+ Make the guess action character item image look more like the one from the board on the question tab and the reply page.
+ Use local storage for the user id.
+ Need better avatar icons.
+ Improve theming
+ A better 'new game' animation might be to have the + button turn into an indefinite progress bar. When the creation is complete, the box can 'poop' out a new game item, and then slide to the 'next spot' on the page, turning into a + sign again.
+ I should have a better animation when guessing right or wrong. Something fun instead of reading text. Maybe like confetti if they guess right, and then a cloudy rain thing if they're wrong

###Unit Tests

+ Fix the server unit tests to pass without always failing
+ Create client side tests