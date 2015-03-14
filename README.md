WebGameBridge.js
==================

A web based library for simple support for Google Play Games. It also acts as an interface to make native-like games on Android while programming a web game.

_Currently Supported_
* Authentication
* Leaderboards
* Achievements

There are a few additional features to make it easier for game developers. These features are designed to be entirely optional and you don't have to touch any of it.
* Snackbars/Toast notifications
* Virtual Gamepad
* Splash screens
* Simple fullscreen menus
* Elegant authorization/start screen
* Music & SFX players

Anything else can be done with custom code from the developer reference. Since the user is authenticated, any additional request within the scope should work.

## Add To Your Project
Add both this javascript file and the Google Client library to the bottom of the page:

    <script src="game_auth_lib.js"></script>
    <script src="https://apis.google.com/js/client.js?onload=handleClientLoad"></script>
    </body>
    
This library requires jQuery for the Virtual Gamepad to work. However, other parts will work without it.

Then above that create a script tag with three variables:

    var clientId = 'xxx.apps.googleusercontent.com';
    var apiKey = 'yyy';
    var scopes = 'https://www.googleapis.com/auth/games https://www.googleapis.com/auth/plus.me';
    
There are a few other parameters you can set:

    var menus_array = {main: "mainMenu", pause: "pauseMenu", auth: "authMenu", game: undefined};
    //In the format {menu_name, element_id}
    var splashes = [];
    
The `clientId` and `apiKey` are determined from the Google Developer Console.

To allow login, you will need to provide an authentication button. Use one like this (it will need that id):

    <button id="authorize-button" style="visibility: hidden">Authorize</button
    
After being connected, you can use the function `onConnected` to run the game after login is complete. You will also be able to use the library and make API calls. 
    
    //In this sample, I pass menus to the MenuManager, then I execute a custom function which sets up the main menu
    function onConnected() { 
        menus.setMenus(menus_array);
        mainMenu();
    }
    
    //If this function is called, the user is not authenticated. I show a splash start screen
    function onNeedAuth() {
        generateAuthSplash("authMenu", "http://img.wonderhowto.com/img/62/01/63528429515533/0/play-game-boy-advance-game-boy-color-games-your-ipad-iphone-no-jailbreaking.w654.jpg");
        menus.open("auth");
    }

## API
### Leaderboard
The global variable `GPGLeaderboard` gives you simple access to leaderboard methods.

#### Timespan
A timespan is the length of time since the leaderboard was set. There are three values you can provide:
* `LEADERBOARDS.DAILY` - Scores from today
* `LEADERBOARDS.WEEKLY` - Scores since the last week
* `LEADERBOARDS.ALL_TIME` - Scores since forever

#### Ranktype
A ranktype is stating the scope of the scores you want
* `LEADERBOARDS.PUBLIC` - All scores
* `LEADERBOARDS.SOCIAL` - Only people from your circles

#### LeaderboardRequest - GPGLeaderboard
| Method | Parameters | Return | Description |
| --- | --- | --- | --- |
| `.refresh` | - | - |          Pulls down the latest leaderboards from the server. This probably shouldn't be called as this is done internally |
| `.getList` | - | JSON object of all leaderboards | This returns an object of leaderboards, with each key being the name set in the developer console |
| `.getPlayerScore(leaderboard, timespan, ranktype, callbackfnc)` | `leaderboard` - The leaderboard object you want to get data for; `timespan` - The timespan you want the score for; `ranktype` - The scope of the scores you want; `callbackfnc` - A function that will be called when the data returns. There is one parameter: a response of all the content from the server| | This function gets the player's score for a specific leaderboard |
| `.listLeaderboardScore(leaderboard, timespan, ranktype, callbackfnc)` | `leaderboard` - The leaderboard object you want to get data for; `timespan` - The timespan you want the score for; `ranktype` - The scope of the scores you want; `callbackfnc` - A function that will be called when the data returns. There is one parameter: a response of all the content from the server.| | This function gets the top scores for a specific leaderboard | 
| `.update(leaderboard, score, callbackfnc)` | `leaderboard` - The leaderboard object you want to update; `score` - The score you wish to submit; `callbackfnc` - A function that will be called when the data returns. There is one parameter: a response of all the content from the server. | |Sends a score to the server, checking whether or not it is a high score, and adding it to the leaderboard |
| `.launchAndroid()` | - | - | Sends an intent on Android devices to open up the related Google Play Games activity. This probably shouldn't be called by 3rd party code |
| `.buildRichHtml(leaderboard, score, record_type)` | `leaderboard` - The leaderboard object you want to update; `score` - The score you wish to submit; `record_type` - Not used | HTML block for a `Snackbar` | Creates a block of HTML designed to be placed inside of a `Snackbar` |

### Achievements
The global variable `GPGAchievements` gives you simple access to achievement methods.

#### Achievement Attributes
* `ACHIEVEMENTS.STANDARD` - A basic achievement
* `ACHIEVEMENTS.INCREMENTAL` - An achievement that contains multiple steps to unlock
* `ACHIEVEMENTS.HIDDEN` - An achievement that the user doesn't see
* `ACHIEVEMENTS.REVEALED` - A locked achievement that the user can see and figure out how to solve
* `ACHIEVEMENTS.UNLOCKED` - An achievement the user has already received

#### AchievementRequest - GPGAchievements
| Method | Parameters | Return | Description |
| --- | --- | --- | --- |
| `.update()` | - | - | Internally syncs achievement data |
| `.increment(achievement, steps, callbackfnc)` | `achievement` - The achievement object you want to increment; `steps` - The number of steps you want to add to the achievement; `callbackfnc` - A function to be called when the data returns, with parameters `currSteps` and `newlyUnlocked` | - | Increments an incremental achievement |
| `.getList()` | - | A JSON object of achievements, where each key corresponds to the name on the developer console | Gets all the achievements for the game |
| `.getPlayerProgress(callbackfnc)` | `callbackfnc` - A function to be called when the data returns | Gets all the achievement results based on your current results | 
| `.reveal(achievement, callbackfnc)` | `achievement` - The achievement object you want to reveal; `callbackfnc` - A function to be called when the data returns, has the `currentstate` as a single parameter | - | Turns an achievement from hidden to revealed | 
| `.setSteps(achievement, minsteps, callbackfnc)` | `achievement` - The achievement object you want to modify; `minsteps` - The number of steps you want to set the achievement to (although it doesn't decrement); `callbackfnc` - A function to be called, with parameters `currentSteps` and `newlyUnlocked` | Programatically fixes the number of steps unlocked in an achievement |
| `.unlock(achievement, callbackfnc)` | `achievement` - The achievement object you want to modify; `callbackfnc` - Function called when data returns, has one parameter of `newlyUnlocked` |
| `.buildRichHtml(achievement)` | `achievement` - The achievement object you want to display | HTML block for a snackbar | Creates a sample `Snackbar` layout for a given achievement
| `.getAchievementById(ach_id)` | `ach_id` - The longform id of the achievement | An achievement object | Finds an achievement from an id number |

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

#### Key
| Method | Parameters | Return | Description |
| --- | --- | --- | --- |
| `Key(keycode, ctrl, shft, alt)` | `keycode` - JS keycode, `ctrl` - Was ctrl down?, `shft` - Was shift down?, `alt` - Was the alt key down? | `Key` | Constructor
| `.key` | - | Keycode | |
| `.ctrl` | - | boolean indicator | |
| `.shift` | - | boolean indicator | |
| `.meta` | - | boolean indicator | |

#### VirtualGamepad
##### Default Keys
* `W` - The 'W' key and default Up for player 2
* `A` - The 'A' key and the default left for player 2
* `S` - The 'S' key and the default down for player 2
* `D` - The 'D' key and the default right for player 2
* `Enter` - The enter key and the default selection button on gamepads (A)
* `Spacebar` - The spacebar an the default jump button on gamepads (Y)
* `Left` - The left key or left direction on a gamepad
* `Right` - The right key or right direction on a gamepad
* `Up` - The up key or up direction on a gamepad
* `Down` - The down key or down direction on a gamepad
* `Back` - The escape key or the back button on Android

##### Methods
| Method | Parameters | Return | Description |
| --- | --- | --- | --- |
| `.pressKey(key)` | `key` - The key that is being pressed | - | You can manually trigger a keypress |
| `.releaseKey(key)` | `key` - The key that was just released | - | You can manually trigger a keyrelease | 
| `.tapKey(key)` | `key` - The key that was tapped | - | Triggers a keypress and then a release soon after |
| `.keyspressed` | | | An object containing keys currently pressed |
| `.keystapped` | | | An object containing keys currently tapped (but soon disappear) |
| `.keyhistory` | | | An queue containing the keys that were last pressed and released |
| `.HISTORY_LENGTH` | | | How many keys should be stored in the history? Default is `5` | 
| `.isDown(key)` | `key` - Key to test OR an array of keys to test simulatenously | | Determines whether a key is down |
| `.wasDone(keyList)` | `keyList` - An array of keys to test in a given order | | Determines whether a key combination was just pressed |
| `.addKey(name, def)` | `name` - The name of the key you want to add, `def` - What is the key value? | | Adds a new key mapping to the Gamepad |
| `.setVirtualPad(b)` | `b` - Boolean setting the `virtualPad` property | | Should the virtual pad be enabled or disabled? |
| `.needVirtualPad()` | | Boolean indicating whether the virtual keyboard should be displayed | Is the virtual pad enabled by default? |
| `.hideVirtualPad()` | | | DOM override that hides all objects of class `virtual-key` |
| `.showVirtualPad(force)` | `force` - This forces the virtual pad to appear instead of going with the default (from `.needVirtualPad()`) |
| `.input(key_id)` | `key_id` - The id corresponding to a key in `GamePad.KEYS` | | Sends a keypress based on the input. This can be used on a virtualkey's `onclick` method to simulate a key being pressed |
| `.export(key_id)` | `key_id` - The id corresponding to a key in `GamePad.KEYS` | | Sends a keyrelease based on the id |

#### Custom Controls
If you want to create a custom control for easy pointing, this is what you should do:
* Create a new Key object
* Assign it to the GamePad by calling: `GamePad.addKey('custom', new Key(10, false, false, true))`
* Access it by calling `GamePad.KEYS.custom`

### Menus
There is a simple menu system build into the library which allows you to call up different 'scenes' that don't exist in your game, such as the pause menu, authentication menu, and achievement menu

#### MENUS Enum
Here are some default menus that you can use
* `MENUS.MAIN` - The main menu / title screen
* `MENUS.PAUSE` - The pause menu while in-game
* `MENUS.AUTH` - The menu displayed when the user needs to log in
* `MENUS.GAME` - The game canvas / element
* `MENUS.SPLASH` - The splash screen
* `MENUS.ACHIEVEMENTS` - The achievements menu
* `MENUS.LEADERBOARD` - The leaderboard menu

#### MenuManager - Global variable `menus`
| Method | Parameters | Return | Description |
| --- | --- | --- | --- |
| `.menus` | | | An object containing each menu, where the key is the menu name and the value is the HTML id of it |
| `.currMenu` | | | The currently accessed menu |
| `.c` | | | The current column count, for DPAD navigation |
| `.r`| | | The current row count, for DPAD navigation |
| `.setMenus(json)` |`json` - A json object of menus, where the key is the menu name and the value is the HTML id | | Sets all the menus based on their HTML element ids |
| `.current()` | | The key of the current menu | Returns which menu is currently accessed | 
| `.open(menu)` | `menu` - The key of the menu you wish to open | | Hides all the menus, shows the one selected. If you are opening 'Achievements' or 'Leaderboard' on Android, it will open the native activities instead. If you are opening the 'Game' menu, it will try to show the virtualpad. It will launch the `onOpen` function of the newly selected menu (see below) |
| `.getMenu(menu)` | `menu` - The id of the menu | The menu object | Returns the menu of the given name |

#### `onOpen` 
A menu may execute a few lines of code after it is opened. In order to do this, the `onOpen` function must be added to the menu after initializing them:

     menus.setMenus(...);
     menus.getMenu(MENUS.PAUSE).onOpen = function() {
        onPause();  
    };
    
### Splashscreens
If you want to display any sort of content ahead of actual gameplay, it should be done as a splashscreen - a simple compilation of images that display after one another. This module requires jQuery to run and should activate automatically when the document is ready.

#### SplashScreens - Global variable `Splashes` 
| Method | Parameters | Return | Description |
| --- | --- | --- | --- |
| `.screens` | | | The array of image urls |
| `.period` | | | The duration of each image. Default is 2500ms |
| `.previous` | | | The previous menu. Default is `MENUS.AUTH` |
| `.setScreens(screens)` | `screens` - An array of image urls to be displayed | | Initializes the splashes to use |
| `.execute(id)` | `id` - The optional splashscreen to start from, should enter `0` in most cases | | Runs through the splashscreen system and then returns to the previous menu |

### AudioManager / MusicManager
There are two classes to help devs add sound effects and music into their game. Both use the WebAudio API and can be customized with additional effects.

**NOTE: MANY WEB BROWSERS STILL DO NOT SUPPORT WEB AUDIO. ANDROID 4.4 DOES NOT, though ANDROID 5.0 DOES**

#### `AudioPlayer`
| Method | Parameters | Return | Description |
| --- | --- | --- | --- |
| `.audiocontext` | | | An `AudioContext` |
| `.context` | | | A new `AudioContext` |
| `.sounds` | | | An object of audio buffers with a given name as a key |
| `.playing` | | | An array of `AudioBufferSources` that have started to be played |
| `.buffer(name, url, done)` | `name` - The key to identify the sound, `url` - The url to access the sound, `done` - A callback function which may be executed when the buffering is finised | | Initializes a sound |
| `.isSupported()` | | boolean | Indicates whether Web Audio is supported in the browser or not |
| `.playSound(key, volume)` | `key` - The key of the sound, `volume` - A percentage of volume for the sound | Plays a sound once |
| `.play(url)` | `url` - The location of the sound | | A quick-start function that buffers a song and plays as soon as it is ready |
| `.preloadAll(sources)` | `sources` - An array of urls to buffer | | Buffers a bunch of songs at once, with a key that is equivalent to the sound's index in the original array |
| `.stopAllAudio()` | | | Stops all audio |

#### `MusicPlayer`
The music is broken into two segments: Prelude, and Loop. Prelude audio plays once, and then after it is done a second track plays which loops indefinitely. If you don't have any prelude track, use the loop as both tracks

| Method | Parameters | Return | Description |
| --- | --- | --- | --- |
| `.playlist` | | | An object containing the music to play |
| `.currenttime` | | | The current time in the song |
| `.setPrelude(url)` | `url` - URL of the sound | |  Sets the prelude track |
| `.setLoop(url)` | `url` - URL of the track | | Sets the loop track |
| `.initPlaylist(prelude, loop)` | `prelude` - Prelude track URL, `loop` - Loop track URL | | Sets both tracks in a single function |
| `.startMusic(options)` | `options` - An object containing various player options {`volume`: percentage `0`-`1`} | | Starts playing the prelude; when finished, it starts the loop track |


## WGB.JS on Android
If you wish to compile your game in an Android app, follow this tutorial:

* First, make sure you read https://developers.google.com/games/services/android/quickstart and the follow the instructions for creating an Android game
* Create a new Android project, and import the relevant Java classes from this project
* Import the `gamehelper_strings.xml` from the resources folder
* Create your main activity, and make it an extension of a `WebViewActivity`
* You only need to add an `onCreate` method and call `initialize`

```Java
     public class EpicTableTennis extends WebViewActivity {
     @Override
     protected void onCreate(Bundle savedInstanceState) {
        initialize("http://felkerdigitalmedia.com/pong/retro.php", new String[]{"Games", "Plus"});
        super.onCreate(savedInstanceState);
     }
```    
    
`initialize` has two parameters: 
* the base url of the game
* A string array indicating which APIs to integrate. Right now, only `Games` and `Plus` are supported

* Now, go to your manifest
    * Add the following tag INSIDE of your application tag:
    
```XML
     <meta-data
         android:name="com.google.android.gms.games.APP_ID"
         android:value="@string/app_id" />
```

* Make sure you add an Internet permission inside of the mainfest tag
    
    `<uses-permission android:name="android.permission.INTERNET" />`


The app id comes from the developer console and it MUST be added as a string to a string xml file.

Now you should be good to go!

### Android TV
GamePad support and other features work well on both Android mobile devices and TVs. Here's how to optimize your game for Android TV

* Mark default features as not required

```XML
      <uses-feature
        android:name="android.hardware.gps"
        android:required="false" />
     <uses-feature
        android:name="android.hardware.location"
        android:required="false" />
     <uses-feature
        android:name="android.hardware.location.gps"
        android:required="false" />
     <uses-feature
        android:name="android.hardware.touchscreen"
        android:required="false" />
     <uses-feature
        android:name="android.hardware.telephony"
        android:required="false" />
     <uses-feature
        android:name="android.hardware.camera"
        android:required="false" />
     <uses-feature
        android:name="android.hardware.nfc"
        android:required="false" />
     <uses-feature
        android:name="android.hardware.microphone"
        android:required="false" />
     <uses-feature
        android:name="android.hardware.wifi"
        android:required="false" />
     <uses-feature
        android:name="android.hardware.bluetooth"
        android:required="false" />
     <uses-feature
        android:name="android.hardware.gamepad"
        android:required="false" />
```    
    
* Add the leanback launcher to your main activity, as well as a 320x180 banner image

```XML
     <activity
            android:name="com.felkertech.n.epictabletennis.EpicTableTennis"
            android:banner="@drawable/banner3"
            android:logo="@drawable/icon"
            android:label="@string/title_activity_epic_table_tennis" >
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LEANBACK_LAUNCHER" />
            </intent-filter>
        </activity>
```

* Mark this application as a game

```XML
     <application
        android:allowBackup="true"
        android:icon="@drawable/icon"
        android:isGame="true"
        android:label="@string/app_name"
        android:theme="@style/AppTheme" >
```
