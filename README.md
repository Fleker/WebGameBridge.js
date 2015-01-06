GooglePlayGames.js
==================

A web based library for simple support for Google Play Games.

_Currently Supported_
* Authentication
* Leaderboards
* Achievements

There are a few additional features to make it easier for game developers
* Snackbars/Toast notifications
* Virtual Gamepad

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
* `.makeRichToast(text, length)` - Displays a larger snackbar, with room for more HTML
* `.isEnabled()` - Checks whether the developer has allowed snackbars for things like achievements and leaderboards
* `LENGTH_SHORT` - 3000 milliseconds
* `LENGTH_LONG` - 6000 milliseconds
* `SNACKBAR_ENABLED` - Are snackbars for achievements and leaderboards enabled (defaults to `true`)

#### Custom Style
You can inject custom stylesheets into the body to enable custom snackbars UIs.
The `.snackbar` class manages the style of a snackbar when it is hidden.
The `.snackbar-on` class is added when the snackbar is to be shown. This class should transition the object into the desired location.
The classes `.snackbar-text` and `.snackbar-rich` are added when the given type of snackbar is present

### Virtual Gamepad
A virtual gamepad is a digital representation of a game controller. On a laptop or desktop computer, you may navigate characters using a keyboard. This isn't necessarily possible on a mobile device. These functions abstract out this system. A mobile phone can trigger an HTML DPAD and a laptop can trigger a mechanical DPAD and they're interpreted the same way. 

Let's say you want to move down. On a laptop, it's as easy as pressing the down key.

But let's make the game portable. You can check the viewport or user agent or just have an option for on-screen controls. There's a `div` or whatever and when pressed, this code is executed:

`GamePad.pressKey(GamePad.KEYS.Down)`

Where `GamePad` is a global variable containing relevant methods.

`GamePad.releaseKey(GamePad.KEYS.Down)` is executed when the user lets go of the key. (Alternatively, the `GamePad.tapKey(GamePad.KEYS.Down)` will both press and release the key)

Either way, you use a single method to check if that key is pressed:
`GamePad.isDown(GamePad.KEYS.Down)`

#### Custom Controls
This is coming soon. Alternatively, you can just override the attributes in the GamePad.KEYS object.
