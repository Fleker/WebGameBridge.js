GooglePlayGames.js
==================

A web based library for simple support for Google Play Games.

_Currently Supported_
* Authentication
* Leaderboards
* Achievements

There are a few additional features to make it easier for game developers
* Snackbars/Toast notifications

Anything else can be done with custom code from the developer reference. Since the user is authenticated, any additional request within the scope should work.

## Add To Your Project
Add both this javascript file and the Google Client library to the bottom of the page:

    <script src="game_auth_lib.js"></script>
    <script src="https://apis.google.com/js/client.js?onload=handleClientLoad"></script>
    </body>

Then above that create a script tag with three variables:

    var clientId = 'xxx.apps.googleusercontent.com';
    var apiKey = 'yyy';
    var scopes = 'https://www.googleapis.com/auth/games https://www.googleapis.com/auth/plus.me';
    
The `clientId` and `apiKey` are determined from the Google Developer Console.

To allow login, you will need to provide an authentication button. Use one like this (it will need that id):

    <button id="authorize-button" style="visibility: hidden">Authorize</button
    
After being connected, you can use the function `onConnected` to run the game after login is complete. You will also be able to use the library and make API calls. 

## API
### Leaderboard
The global variable `GPGLeaderboard` gives you simple access to leaderboard methods.

### Achievements
The global variable `GPGAchievements` gives you simple access to achievement methods.

### Snackbars
The global variable `Snackbar` is used to manage snackbars.
#### Methods
* `.makeToast(text, length)` - Displays text in a snackbar for a given number of milliseconds
* `.isEnabled()` - Checks whether the developer has allowed snackbars for things like achievements and leaderboards
* `LENGTH_SHORT` - 3000 milliseconds
* `SNACKBAR_ENABLED` - Are snackbars for achievements and leaderboards enabled (defaults to `true`)

#### Custom Style
You can inject custom stylesheets into the body to enable custom snackbars UIs.
The `.snackbar` class manages the style of a snackbar when it is hidden.
The `.snackbar-on` class is added when the snackbar is to be shown. This class should transition the object into the desired location.
