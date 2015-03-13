package com.felkertech.n.myapplication;

import android.app.Activity;
import android.app.UiModeManager;
import android.content.Context;
import android.content.Intent;
import android.content.res.Configuration;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.Message;
import android.support.annotation.NonNull;
import android.os.Bundle;
import android.util.Log;
import android.util.SparseArray;
import android.view.InputDevice;
import android.view.KeyEvent;
import android.view.Menu;
import android.view.MenuItem;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.ConsoleMessage;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.RelativeLayout;
import android.widget.Toast;

import com.example.inputmanagercompat.InputManagerCompat;
import com.felkertech.n.myapplication.Utils.MovementDirection;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.common.api.PendingResult;
import com.google.android.gms.common.api.Result;
import com.google.android.gms.common.api.ResultCallback;
import com.google.android.gms.common.api.Status;
import com.google.android.gms.games.Games;
import com.google.android.gms.games.GamesStatusCodes;
import com.google.android.gms.games.achievement.Achievement;
import com.google.android.gms.games.achievement.AchievementBuffer;
import com.google.android.gms.games.achievement.Achievements;
import com.google.android.gms.games.leaderboard.Leaderboard;
import com.google.android.gms.games.leaderboard.LeaderboardBuffer;
import com.google.android.gms.games.leaderboard.LeaderboardScore;
import com.google.android.gms.games.leaderboard.LeaderboardScoreBuffer;
import com.google.android.gms.games.leaderboard.Leaderboards;
import com.google.android.gms.games.leaderboard.ScoreSubmissionData;
import com.google.android.gms.plus.Plus;
import com.google.example.games.basegameutils.BaseGameUtils;

import java.util.HashMap;
import java.util.Iterator;

/**
 * This is a WebView activity. You just need to provide a few parameters related to your game.
 * Everything else in this library can be handled on its own.
 * Developers who wish to use this library should just be able to extend this activity.
 */
//TODO Provide a function to disable touch controls if on ATV
public class WebViewActivity extends Activity implements GoogleApiClient.ConnectionCallbacks,
        GoogleApiClient.OnConnectionFailedListener, InputManagerCompat.InputDeviceListener {
    WebView body;
    BridgeClient client;
    String currentUrl;
    RelativeLayout frame;

    //GAME ATTRIBUTES
    private static final String TAG = "WebBridge::WVA";

    private static final String KEY_IN_RESOLUTION = "is_in_resolution";

    /**
     * Request code for auto Google Play Services error resolution.
     */
    protected static final int REQUEST_CODE_RESOLUTION = 1;
    /**
     * Sign-in required
     */
    private static final int RC_SIGN_IN = 9001;
    private boolean mResolvingConnectionFailure = false;
    private boolean mAutoStartSignInflow = true;
    private boolean mSignInClicked = false;
    /** A flag indicating that a PendingIntent is in progress and prevents
     * us from starting further intents.
     */
    private boolean mIntentInProgress;

    /**
     * Google API client.
     */
    private GoogleApiClient mGoogleApiClient;
    boolean mExplicitSignOut = false;
    boolean mInSignInFlow = false; // set to true when you're in the middle of the
    // sign in flow, to know you should not attempt
    // to connect in onStart()

    /**
     * Determines if the client is in a resolution state, and
     * waiting for resolution intent to return.
     */
    private boolean mIsInResolution;
    private boolean mAutoStartSignInFlow = true;

    /**
     * Input Devices Management
     */
    Dpad mDpad = new Dpad();
    GamePad mGamePad = new GamePad();

    /**
     * Called when the activity is starting. Restores the activity state.
     */
    String url;
    String[] APIs;
    public void initialize(String url, String[] APIs) {
        this.url = url;
        this.APIs = APIs;
    }
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (savedInstanceState != null) {
            mIsInResolution = savedInstanceState.getBoolean(KEY_IN_RESOLUTION, false);
        }
        //TODO You should make this a parameter
        if (mGoogleApiClient == null) {
            GoogleApiClient.Builder bob = new GoogleApiClient.Builder(this);
            for(String i: APIs) {
                if(i.equals("Games")) {
                    bob.addApi(Games.API)
                        .addScope(Games.SCOPE_GAMES);
                } else if(i.equals("Plus")) {
                    bob.addApi(Plus.API)
                        .addScope(Plus.SCOPE_PLUS_LOGIN);
                }
}               // Optionally, add additional APIs and scopes if required.
                //.addApi(Drive.API).addScope(Drive.SCOPE_APPFOLDER) // Drive API
                    bob.addConnectionCallbacks(this)
                        .addOnConnectionFailedListener(this);
            mGoogleApiClient = bob.build();
        }
        frame = new RelativeLayout(this);
        body = new WebView(this);
        body.clearCache(true);
        body.setLayoutParams(new WebView.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT, 0, 0));
        WebSettings webSettings = body.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setSupportZoom(false);
        webSettings.setSupportMultipleWindows(true);
        webSettings.setJavaScriptCanOpenWindowsAutomatically(true);
        body.addJavascriptInterface(new WebAppInterface(this), "Android");
        body.setWebChromeClient(new MyChromeClient());
        body.setWebViewClient(new BridgeClient());
        body.setKeepScreenOn(true);
        frame.setBackgroundColor(getResources().getColor(android.R.color.background_dark));
        Log.d(TAG, "WebView Activity Created");
        frame.addView(body);
        setContentView(frame);
        //FIXME In future builds this will be the only required function
        body.loadUrl(url+"?android=1");

        final View decorView = getWindow().getDecorView();
        decorView.setOnSystemUiVisibilityChangeListener(
                new View.OnSystemUiVisibilityChangeListener() {
                    @Override
                    public void onSystemUiVisibilityChange(int i) {
                        int height = decorView.getHeight();
                        Log.i(TAG, "Current height: " + height);

                    }
                });
        toggleHideyBar();
    }
    /**
     * Detects and toggles immersive mode (also known as "hidey bar" mode).
     * Not mine (From Google's tutorial)
     */
    public void toggleHideyBar() {

        // The UI options currently enabled are represented by a bitfield.
        // getSystemUiVisibility() gives us that bitfield.
        int uiOptions = getWindow().getDecorView().getSystemUiVisibility();
        int newUiOptions = uiOptions;
        boolean isImmersiveModeEnabled =
                ((uiOptions | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY) == uiOptions);
        if (isImmersiveModeEnabled) {
            Log.i(TAG, "Turning immersive mode mode off. ");
        } else {
            Log.i(TAG, "Turning immersive mode mode on.");
        }

        // Navigation bar hiding:  Backwards compatible to ICS.
        if (Build.VERSION.SDK_INT >= 14) {
            newUiOptions ^= View.SYSTEM_UI_FLAG_HIDE_NAVIGATION;
        }

        // Status bar hiding: Backwards compatible to Jellybean
        if (Build.VERSION.SDK_INT >= 16) {
            newUiOptions ^= View.SYSTEM_UI_FLAG_FULLSCREEN;
        }

        // Immersive mode: Backward compatible to KitKat.
        // Note that this flag doesn't do anything by itself, it only augments the behavior
        // of HIDE_NAVIGATION and FLAG_FULLSCREEN.  For the purposes of this sample
        // all three flags are being toggled together.
        // Note that there are two immersive mode UI flags, one of which is referred to as "sticky".
        // Sticky immersive mode differs in that it makes the navigation and status bars
        // semi-transparent, and the UI flag does not get cleared when the user interacts with
        // the screen.
        if (Build.VERSION.SDK_INT >= 19) {
            newUiOptions ^= View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY;
        }

        getWindow().getDecorView().setSystemUiVisibility(newUiOptions);
    }
    @Override
    public boolean onKeyDown(int key, KeyEvent keyEvent) {
        switch(key) {
            case KeyEvent.KEYCODE_BUTTON_A:
                eval("GamePad.pressKey(GamePad.KEYS.Enter)");
                return true;
            case KeyEvent.KEYCODE_BUTTON_Y:
                eval("GamePad.pressKey(GamePad.KEYS.Spacebar)");
                return true;
            case KeyEvent.KEYCODE_BUTTON_B:
                return false;
            case KeyEvent.KEYCODE_BACK:
                eval("GamePad.pressKey(GamePad.KEYS.Back)");
                return false;
        }

        return super.onKeyDown(key, keyEvent);
    }
    @Override
    public boolean onKeyUp(int key, KeyEvent keyEvent) {
        switch(key) {
            case KeyEvent.KEYCODE_BUTTON_A:
                eval("GamePad.releaseKey(GamePad.KEYS.Enter");
            case KeyEvent.KEYCODE_BUTTON_Y:
                eval("GamePad.releaseKey(GamePad.KEYS.Spacebar");
            case KeyEvent.KEYCODE_BACK:
                eval("GamePad.releaseKey(GamePad.KEYS.Back)");
                return false;
        }

        return super.onKeyUp(key, keyEvent);
    }

    //todo sfx
    @Override /* To handle generic motion events like a joystick */
    public boolean onGenericMotionEvent(MotionEvent m) {
        Log.d(TAG, "Got GenericMotion "+m.getX()+", "+m.getY());
        // Check if this event if from a D-pad and process accordingly.
        if (Dpad.isDpadDevice(m)) {
            Log.d(TAG, "Got Dpad Input");
            int press = mDpad.getDirectionPressed(m);
            int deviceId = m.getDeviceId();
            Log.d(TAG, "From device "+deviceId+"; P"+mControllers.indexOfValue(getShipForID(deviceId)));
            if(deviceId != -1) {
                ControllerConnection cc = getShipForID(deviceId);
                if(mControllers.indexOfValue(cc) == 0) {
                    switch (press) {
                        case Dpad.LEFT:
                            // Do something for LEFT direction press
                            eval("GamePad.pressKey(GamePad.KEYS.Left)");
                            return true;
                        case Dpad.RIGHT:
                            // Do something for RIGHT direction press
                            eval("GamePad.pressKey(GamePad.KEYS.Right)");
                            return true;
                        case Dpad.UP:
                            // Do something for UP direction press
                            eval("GamePad.pressKey(GamePad.KEYS.Up)");
                            return true;
                        case Dpad.DOWN:
                            //Do something
                            eval("GamePad.pressKey(GamePad.KEYS.Down)");
                            return true;
                        default:
                            eval("GamePad.releaseKey(GamePad.KEYS.Left)");
                            eval("GamePad.releaseKey(GamePad.KEYS.Right)");
                            eval("GamePad.releaseKey(GamePad.KEYS.Up)");
                            eval("GamePad.releaseKey(GamePad.KEYS.Down)");
                            return true;
                    }
                } else if(mControllers.indexOfValue(cc) == 1) {
                    switch (press) {
                        case Dpad.LEFT:
                            // Do something for LEFT direction press
                            eval("GamePad.pressKey(GamePad.KEYS.A)");
                            return true;
                        case Dpad.RIGHT:
                            // Do something for RIGHT direction press
                            eval("GamePad.pressKey(GamePad.KEYS.D)");
                            return true;
                        case Dpad.UP:
                            // Do something for UP direction press
                            eval("GamePad.pressKey(GamePad.KEYS.W)");
                            return true;
                        case Dpad.DOWN:
                            //Do something
                            eval("GamePad.pressKey(GamePad.KEYS.S)");
                            return true;
                        default:
                            eval("GamePad.releaseKey(GamePad.KEYS.W)");
                            eval("GamePad.releaseKey(GamePad.KEYS.A)");
                            eval("GamePad.releaseKey(GamePad.KEYS.S)");
                            eval("GamePad.releaseKey(GamePad.KEYS.D)");
                            return true;
                    }
                }
            } else {
                switch (press) {
                    case Dpad.LEFT:
                        // Do something for LEFT direction press
                        eval("GamePad.pressKey(GamePad.KEYS.Left)");
                        return true;
                    case Dpad.RIGHT:
                        // Do something for RIGHT direction press
                        eval("GamePad.pressKey(GamePad.KEYS.Right)");
                        return true;
                    case Dpad.UP:
                        // Do something for UP direction press
                        eval("GamePad.pressKey(GamePad.KEYS.Up)");
                        return true;
                    case Dpad.DOWN:
                        //Do something
                        eval("GamePad.pressKey(GamePad.KEYS.Down)");
                        return true;
                    default:
                        eval("GamePad.releaseKey(GamePad.KEYS.Left)");
                        eval("GamePad.releaseKey(GamePad.KEYS.Right)");
                        eval("GamePad.releaseKey(GamePad.KEYS.Up)");
                        eval("GamePad.releaseKey(GamePad.KEYS.Down)");
                        return true;
                }
            }
        }
        // Check that the event came from a game controller
        if (GamePad.isJoystickInput(m)) {
            Log.d(TAG, "Got joystick input");
            // Process all historical movement samples in the batch
            final int historySize = m.getHistorySize();

            // Process the movements starting from the
            // earliest historical position in the batch
            for (int i = 0; i < historySize; i++) {
                // Process the event at historical position i
                mGamePad.processJoystickInput(m, i);
            }

            // Process the current movement sample in the batch (position -1)
            mGamePad.processJoystickInput(m, -1);
            Log.d(TAG, "GamePad Input: "+mGamePad.getX()+" "+mGamePad.getY());
            switch(mGamePad.getApproximateDirection()) {
                case MovementDirection.UP:
                    eval("GamePad.tapKey(GamePad.KEYS.Up)");
                    return true;
                case MovementDirection.DOWN:
                    eval("GamePad.tapKey(GamePad.KEYS.Down)");
                    return true;
                case MovementDirection.LEFT:
                    eval("GamePad.tapKey(GamePad.KEYS.Left)");
                    return true;
                case MovementDirection.RIGHT:
                    eval("GamePad.tapKey(GamePad.KEYS.Right)");
                    return true;
                default:
                    eval("GamePad.releaseKey(GamePad.KEYS.Left)");
                    eval("GamePad.releaseKey(GamePad.KEYS.Right)");
                    eval("GamePad.releaseKey(GamePad.KEYS.Up)");
                    eval("GamePad.releaseKey(GamePad.KEYS.Down)");
                    return true;
            }
        }
        return super.onGenericMotionEvent(m);
    }
    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            goFullscreen();
        }
    }
    public void goFullscreen() {
        toggleHideyBar();
        return;
        /*if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
            frame.setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                            | View.SYSTEM_UI_FLAG_FULLSCREEN);
        } else if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            frame.setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                            | View.SYSTEM_UI_FLAG_FULLSCREEN
                            | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
        } else {
            frame.setSystemUiVisibility(View.SYSTEM_UI_FLAG_HIDE_NAVIGATION);
        }*/
    }
    /**
     * Runs JavaScript
     */
    public void eval(final String scriptSrc) {
        final View child = frame.getChildAt(frame.getChildCount() - 1);
        //Log.d(TAG, child.getPaddingTop()+"<<");
        child.post(new Runnable() {
            @Override
            public void run() {
                if (scriptSrc.length() < 50)
                    Log.d(TAG, "Execute " + scriptSrc);
                else
                    Log.d(TAG, "Execute " + scriptSrc.substring(0, 49));
                ((WebView) child).loadUrl("javascript:try { " + scriptSrc+"} catch(error) { Android.onError(error.message) }");
//                ((WebView) child).loadUrl("javascript:console.log(1)");
//                body.loadUrl("javascript:console.log(2)");
                ///*(function() {*/  /*)()*/
            }
        });
        new Thread(new Runnable(){
            @Override
            public void run() {

            }
        }).start();
    }
    /**
     * Called when the Activity is made visible.
     * A connection to Play Services need to be initiated as
     * soon as the activity is visible. Registers {@code ConnectionCallbacks}
     * and {@code OnConnectionFailedListener} on the
     * activities itself.
     */
    @Override
    protected void onStart() {
        super.onStart();

//        mGoogleApiClient.connect();

    }
    /**
     * Called when activity gets invisible. Connection to Play Services needs to
     * be disconnected as soon as an activity is invisible.
     */
    @Override
    protected void onStop() {
        super.onStop();
        /*if (mGoogleApiClient.isConnected()) {
            mGoogleApiClient.disconnect();
        }*/
        eval("AudioPlayer.stopAllAudio()");
    }
    /**
     * Saves the resolution state.
     */
    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        outState.putBoolean(KEY_IN_RESOLUTION, mIsInResolution);
    }
    /**
     * Handles Google Play Services resolution callbacks.
     */
    @Override
    protected void onActivityResult(int requestCode, int resultCode,
                                    Intent intent) {
        if (requestCode == RC_SIGN_IN) {
            mSignInClicked = false;
            mResolvingConnectionFailure = false;
            if (resultCode == RESULT_OK) {
                mGoogleApiClient.connect();
            } else {
                // Bring up an error dialog to alert the user that sign-in
                // failed. The R.string.signin_failure should reference an error
                // string in your strings.xml file that tells the user they
                // could not be signed in, such as "Unable to sign in."
                BaseGameUtils.showActivityResultError(this,
                        resultCode, R.string.signin_failure, resultCode,
                        R.string.gamehelper_sign_in_error_other);
            }
        }
    }
    private void retryConnecting() {
        Log.d(TAG, "Connection Failed, retry");
        mIsInResolution = false;
        if (!mGoogleApiClient.isConnecting()) {
            mGoogleApiClient.connect();
        }
    }
    // Call when the sign-in button is clicked
    private void signInClicked() {
        mSignInClicked = true;
        mGoogleApiClient.connect();
    }
    // Call when the sign-out button is clicked
    private void signOutclicked() {
        mSignInClicked = false;
        Games.signOut(mGoogleApiClient);
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_web_view, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }

        return super.onOptionsItemSelected(item);
    }

    /**
     * Called when {@code mGoogleApiClient} is connected.
     */
    @Override
    public void onConnected(Bundle connectionHint) {
        Log.i(TAG, "GoogleApiClient connected");
        // TODO: Start making API requests.
        eval("makeApiCall();");
        // (your code here: update UI, enable functionality that depends on sign in, etc)
    }

    /**
     * Called when {@code mGoogleApiClient} connection is suspended.
     */
    @Override
    public void onConnectionSuspended(int cause) {
        Log.i(TAG, "GoogleApiClient connection suspended");
//        retryConnecting();
        // Attempt to reconnect
        mGoogleApiClient.connect();
    }

    /**
     * Called when {@code mGoogleApiClient} is trying to connect but failed.
     * Handle {@code result.getResolution()} if there is a resolution
     * available.
     */
    @Override
    public void onConnectionFailed(ConnectionResult result) {
        if (mResolvingConnectionFailure) {
            // already resolving
            return;
        }

        // if the sign-in button was clicked or if auto sign-in is enabled,
        // launch the sign-in flow
        if (mSignInClicked || mAutoStartSignInFlow) {
            mAutoStartSignInFlow = false;
            mSignInClicked = false;
            mResolvingConnectionFailure = true;

            // Attempt to resolve the connection failure using BaseGameUtils.
            // The R.string.signin_other_error value should reference a generic
            // error string in your strings.xml file, such as "There was
            // an issue with sign-in, please try again later."
            if (!BaseGameUtils.resolveConnectionFailure(this,
                    mGoogleApiClient, result,
                    RC_SIGN_IN, getString(R.string.gamehelper_sign_in_error_other))) {
                mResolvingConnectionFailure = false;
            }
        }

        // Put code here to display the sign-in button

    }
    public boolean isSignedIn() {
        if (mGoogleApiClient != null && mGoogleApiClient.isConnected()) {
            // signed in. Show the "sign out" button and explanation.
            return true;
        } else {
            // not signed in. Show the "sign in" button and explanation.
            return false;
        }
    }
    public void signOut() {
        // user explicitly signed out, so turn off auto sign in
        mExplicitSignOut = true;
        if (mGoogleApiClient != null && mGoogleApiClient.isConnected()) {
            Games.signOut(mGoogleApiClient);
            mGoogleApiClient.disconnect();
        }
    }
    public void signIn() {
        // start the asynchronous sign in flow
        mSignInClicked = true;
        mGoogleApiClient.connect();
    }

    public class WebAppInterface {
        Context mContext;
        WebLeaderboardRequest GPGLeaderboard;
        HashMap<String, WebLeaderboard> LeaderboardArray;
        HashMap<String, WebAchievement> AchievementArray;

        /** Instantiate the interface and set the context */
        WebAppInterface(Context c) {
            mContext = c;
            GPGLeaderboard = new WebLeaderboardRequest();
            LeaderboardArray = new HashMap<>();
            AchievementArray = new HashMap<>();
        }

        /** Show a toast from the web page */
        @JavascriptInterface
        public void showToast(String toast) {
            Toast.makeText(mContext, toast, Toast.LENGTH_SHORT).show();
        }
        @JavascriptInterface
        public void onError(final String error){
            runOnUiThread(new Runnable() {
                  @Override
                  public void run() {
                      Log.e(TAG, "ERROR: " + error);
//                      throw new IllegalArgumentException(error);
                  }
              });
        }
        @JavascriptInterface
        public void GooglePlayGamesConnect() {
            GPGLeaderboard_refresh();
        }
        @JavascriptInterface
        public void GPGLeaderboard_refresh() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    PendingResult<Leaderboards.LeaderboardMetadataResult> p = Games.Leaderboards.loadLeaderboardMetadata(mGoogleApiClient, false);
                    p.setResultCallback(new ResultCallback<Leaderboards.LeaderboardMetadataResult>() {
                        @Override
                        public void onResult(Leaderboards.LeaderboardMetadataResult leaderboardMetadataResult) {
                            LeaderboardBuffer lb = leaderboardMetadataResult.getLeaderboards();
                            Iterator<Leaderboard> il = lb.iterator();
                            while(il.hasNext()) {
                                Leaderboard l = il.next();
                                LeaderboardArray.put(l.getLeaderboardId(), new WebLeaderboard(l.getIconImageUrl(), l.getLeaderboardId(), false, l.getDisplayName(), l.getScoreOrder()));
                                eval("var l = new Leaderboard();");
                                eval("l.setIconUrl('"+l.getIconImageUrl()+"').setId('"+l.getLeaderboardId()+"').setIsIconDefault(false).setName('"+l.getDisplayName()+"').setOrder("+l.getScoreOrder()+");");
                                eval("var n = l.getName().replace(/\\s/g, \"_\");");
                                eval("LeaderboardArray[n] = l;");
                            }
                        }
                    });
                }
            });
        }
        @JavascriptInterface
        public void GPGLeaderboard_getPlayerScore(final String leaderboard, final String timespan, final String ranktype, final String callback) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    PendingResult<Leaderboards.LoadPlayerScoreResult> p = Games.Leaderboards.loadCurrentPlayerLeaderboardScore(mGoogleApiClient, leaderboard, LEADERBOARDS.TIME_TO_INT(timespan), LEADERBOARDS.RANK_TO_INT(ranktype));
                    p.setResultCallback(new ResultCallback<Leaderboards.LoadPlayerScoreResult>() {
                        @Override
                        public void onResult(Leaderboards.LoadPlayerScoreResult loadPlayerScoreResult) {
                            if(loadPlayerScoreResult.getScore() == null) {
                                String v = "{items: [{scoreString: '0', " +
                                        "publicRank:{formattedRank: ''}}]}";
                                eval("("+callback+")("+v+")");
                            } else {
                                String v = "{items: [{scoreString: '"+loadPlayerScoreResult.getScore().getDisplayScore()+"', " +
                                        "publicRank:{formattedRank: '"+loadPlayerScoreResult.getScore().getDisplayRank()+"'}}]}";
                                eval("("+callback+")("+v+")");
                            }
                        }
                    });
                }
            });
        }
        @JavascriptInterface
        public void GPGLeaderboard_listLeaderboardScore(final String leaderboard, final String timespan, final String ranktype, final String callback) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    PendingResult<Leaderboards.LoadScoresResult> p = Games.Leaderboards.loadTopScores(mGoogleApiClient, leaderboard, LEADERBOARDS.TIME_TO_INT(timespan), LEADERBOARDS.RANK_TO_INT(ranktype), 10);
                    p.setResultCallback(new ResultCallback<Leaderboards.LoadScoresResult>() {
                        @Override
                        public void onResult(Leaderboards.LoadScoresResult loadScoresResult) {
                            String exec = "{items: [";
                            LeaderboardScoreBuffer lbs = loadScoresResult.getScores();
                            Iterator<LeaderboardScore> ls = lbs.iterator();
//                            Log.d(TAG, lbs.get(0).getDisplayRank());
                            while(ls.hasNext()) {
                                LeaderboardScore score = ls.next();
                                exec += "{scoreString: '"+score.getDisplayScore()+"'},";
                            }
                            exec += "]}";
                            Log.d(TAG, exec);
                            eval("("+callback+")("+exec+")");
                        }
                    });
                }
            });
        }
        @JavascriptInterface
        public void GPGLeaderboard_update(final String leaderboard, final long score, final String callback) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    PendingResult<Leaderboards.SubmitScoreResult> p = Games.Leaderboards.submitScoreImmediate(mGoogleApiClient, leaderboard, score);
                    p.setResultCallback(new ResultCallback<Leaderboards.SubmitScoreResult>() {
                        @Override
                        public void onResult(Leaderboards.SubmitScoreResult submitScoreResult) {
                            Leaderboards.SubmitScoreResult ssr = submitScoreResult;
                            ScoreSubmissionData.Result all = ssr.getScoreData().getScoreResult(LEADERBOARDS.ALL_TIME);
                            String out = "{beatenTimeSpans: '";
                            if(all.newBest)
                                out += "ALL_TIME ";
                            ScoreSubmissionData.Result week = ssr.getScoreData().getScoreResult(LEADERBOARDS.WEEKLY);
                            if(week.newBest)
                                out += "WEEKLY ";
                            ScoreSubmissionData.Result day = ssr.getScoreData().getScoreResult(LEADERBOARDS.DAILY);
                            if(day.newBest)
                                out += "DAILY ";
                            out += "', formattedScore: '"+all.formattedScore+"'";
                            out += "}";
                            eval("("+callback+")("+out+")");
                        }
                    });
                }
            });
        }

        @JavascriptInterface
        public void GPGAchievement_refresh() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    PendingResult<Achievements.LoadAchievementsResult> p = Games.Achievements.load(mGoogleApiClient, true);
                    p.setResultCallback(new ResultCallback<Achievements.LoadAchievementsResult>() {
                        @Override
                        public void onResult(Achievements.LoadAchievementsResult loadAchievementsResult) {
                            AchievementBuffer ab = loadAchievementsResult.getAchievements();
                            AchievementArray = new HashMap<String, WebAchievement>();
                            Iterator<Achievement> ia = ab.iterator();
                            while(ia.hasNext()) {
                                Achievement ach = ia.next();
                                if(ach.getType() == ACHIEVEMENTS.INCREMENTAL)
                                    AchievementArray.put(ach.getAchievementId(), new WebAchievement(ach.getAchievementId(), ach.getName(), ach.getDescription(),
                                            ach.getType(), ach.getTotalSteps(), ach.getFormattedTotalSteps(), ach.getRevealedImageUrl(), ach.getUnlockedImageUrl(),
                                            ach.getState(), ach.getXpValue(), ach.getCurrentSteps()));
                                else
                                    AchievementArray.put(ach.getAchievementId(), new WebAchievement(ach.getAchievementId(), ach.getName(), ach.getDescription(),
                                            ach.getType(), 1, "1", ach.getRevealedImageUrl(), ach.getUnlockedImageUrl(),
                                            ach.getState(), ach.getXpValue(), 0));
                                WebAchievement a = AchievementArray.get(ach.getAchievementId());
                                eval("var a = new Achievement();");
                                //FIXME Int to String
                                eval("a.setAchievementType('"+ach.getType()+"').setDescription('"+ach.getDescription()+"').setId('"+ach.getAchievementId()
                                    +"').setName('"+ach.getName()+"').setTotalSteps("+a.getTotalSteps()+").setFormattedTotalSteps('"+a.getFormattedTotalSteps()
                                +"').setRevealedIconUrl('"+ach.getRevealedImageUrl()+"').setUnlockedIconUrl('"+ach.getUnlockedImageUrl()+"').setInitialState('"+ach.getState()
                                +"').setExperiencePoints("+ach.getXpValue()+");");
                                eval("var n = a.getName().replace(/\\s/g, \"_\");");
                                eval("AchievementsArray[n] = a;");
                            }
                        }
                    });
                }
            });
        }
        @JavascriptInterface
        public void GPGAchievement_increment(final String achievement, final int steps, final String callback) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    PendingResult<Achievements.UpdateAchievementResult> p = Games.Achievements.incrementImmediate(mGoogleApiClient, achievement, steps);
                    p.setResultCallback(new ResultCallback<Achievements.UpdateAchievementResult>() {
                        @Override
                        public void onResult(Achievements.UpdateAchievementResult updateAchievementResult) {
                            WebAchievement wa = AchievementArray.get(achievement);
                            int previous = wa.getCurrentSteps();
                            int curr = wa.increment(steps);
                            String out = "{currentSteps: "+curr+", ";
                            if(previous < wa.getTotalSteps() && curr >= wa.getTotalSteps())
                                out += "newlyUnlocked: true";
                            else
                                out += "newlyUnlocked: false";
                            out += "}";
                            eval("("+callback+")("+out+")");
                        }
                    });
                }
            });
        }
        @JavascriptInterface
        public void GPGAchievement_getPlayerProgress(final String callback) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    PendingResult<Achievements.LoadAchievementsResult> p = Games.Achievements.load(mGoogleApiClient, true);
                    p.setResultCallback(new ResultCallback<Achievements.LoadAchievementsResult>() {
                        @Override
                        public void onResult(Achievements.LoadAchievementsResult loadAchievementsResult) {
                            AchievementBuffer ab = loadAchievementsResult.getAchievements();
                            Iterator<Achievement> ia = ab.iterator();
                            while(ia.hasNext()) {
                                Achievement ach = ia.next();
                                if(ach.getType() == ACHIEVEMENTS.INCREMENTAL)
                                    AchievementArray.put(ach.getAchievementId(), new WebAchievement(ach.getAchievementId(), ach.getName(), ach.getDescription(),
                                            ach.getType(), ach.getTotalSteps(), ach.getFormattedTotalSteps(), ach.getRevealedImageUrl(), ach.getUnlockedImageUrl(),
                                            ach.getState(), ach.getXpValue(), ach.getCurrentSteps()));
                                else
                                    AchievementArray.put(ach.getAchievementId(), new WebAchievement(ach.getAchievementId(), ach.getName(), ach.getDescription(),
                                            ach.getType(), 1, "1", ach.getRevealedImageUrl(), ach.getUnlockedImageUrl(),
                                            ach.getState(), ach.getXpValue(), 0));
                                WebAchievement a = AchievementArray.get(ach.getAchievementId());
                                eval("var a = new Achievement();");
                                //FIXME Int to String
                                eval("a.setAchievementType('"+ach.getType()+"').setDescription('"+ach.getDescription()+"').setId('"+ach.getAchievementId()
                                        +"').setName('"+ach.getName()+"').setTotalSteps("+a.getTotalSteps()+").setFormattedTotalSteps('"+a.getFormattedTotalSteps()
                                        +"').setRevealedIconUrl('"+ach.getRevealedImageUrl()+"').setUnlockedIconUrl('"+ach.getUnlockedImageUrl()+"').setInitialState('"+ach.getState()
                                        +"').setExperiencePoints("+ach.getXpValue()+")");
                                eval("var n = a.getName().replace(/\\s/g, \"_\");\n" +
                                        "AchievementsArray[n] = a;");
                            }
                            eval("("+callback+")(AchievementsArray)");
                        }
                    });
                }
            });
        }

        @JavascriptInterface
        public void GPGAchievement_reveal(final String achievement, final String callback) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    PendingResult<Achievements.UpdateAchievementResult> p = Games.Achievements.revealImmediate(mGoogleApiClient, achievement);
                    p.setResultCallback(new ResultCallback<Achievements.UpdateAchievementResult>() {
                        @Override
                        public void onResult(Achievements.UpdateAchievementResult updateAchievementResult) {
                            WebAchievement wa = AchievementArray.get(achievement);
                            wa.reveal();
                            String out = "{currentState: 'REVEALED'";
                            if(updateAchievementResult.getStatus().getStatusCode() == GamesStatusCodes.STATUS_ACHIEVEMENT_UNLOCKED)
                                out = "{currentState: 'UNLOCKED'";
                            out += "}";
                            eval("("+callback+")("+out+")");
                        }
                    });
                }
            });
        }

        @JavascriptInterface
        public void GPGAchievement_setSteps(final String achievement, final int minSteps, final String callback) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    PendingResult<Achievements.UpdateAchievementResult> p = Games.Achievements.setStepsImmediate(mGoogleApiClient, achievement, minSteps);
                    p.setResultCallback(new ResultCallback<Achievements.UpdateAchievementResult>() {
                        @Override
                        public void onResult(Achievements.UpdateAchievementResult updateAchievementResult) {
                            WebAchievement wa = AchievementArray.get(achievement);
                            int prev = wa.getCurrentSteps();
                            wa.setCurrentSteps(minSteps);
                            String out = "{currentSteps: "+wa.getCurrentSteps()+", ";
                            if(prev < wa.getTotalSteps() && wa.getTotalSteps() <= wa.getCurrentSteps())
                                out += "newlyUnlocked: true";
                            else
                                out += "newlyUnlocked: false";
                            out += "}";
                            eval("("+callback+")("+out+")");
                        }
                    });
                }
            });
        }

        @JavascriptInterface
        public void GPGAchievement_unlock(final String achievement, final String callback) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    PendingResult<Achievements.UpdateAchievementResult> p = Games.Achievements.unlockImmediate(mGoogleApiClient, achievement);
                    p.setResultCallback(new ResultCallback<Achievements.UpdateAchievementResult>() {
                        @Override
                        public void onResult(Achievements.UpdateAchievementResult updateAchievementResult) {
                            Log.d(TAG, "You are unlocking "+achievement);
                            WebAchievement wa = AchievementArray.get(achievement);
                            Log.d(TAG, wa.toString());
                            int previous = wa.getState();
                            wa.setState(ACHIEVEMENTS.UNLOCKED);
                            String out = "{";
                            if(previous != wa.getState())
                                out += "newlyUnlocked: true";
                            else
                                out += "newlyUnlocked: false";
                            out += "}";
                            eval("("+callback+")("+out+")");
                        }
                    });
                }
            });
        }
        @JavascriptInterface
        public void launchAchievementsIntent() {
            Log.d(TAG, "Opening Achievements");
            Intent i = Games.Achievements.getAchievementsIntent(mGoogleApiClient);
            startActivityForResult(i, 200);
        }
        @JavascriptInterface
        public void launchLeaderboardsIntent() {
            Intent i = Games.Leaderboards.getAllLeaderboardsIntent(mGoogleApiClient);
            startActivityForResult(i, 200);
        }
        //TODO Orientation locking on gamestart

        @JavascriptInterface
        public void Auth_SignIn() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    signIn();
                }
            });
        }

        @JavascriptInterface
        public void exit() {
            finish();
        }
    }
    public abstract static class IntentResults {
        public abstract static class Leaderboards {
            public static int GETALL = 1001;
        }
    }

    public class BridgeClient extends WebViewClient {
        public BridgeClient() {
            super();
        }
        @Override
        public void onLoadResource(WebView v, String u) {
            Log.d(TAG, u+" "+url+"; "+u.equals(url));
            Uri link = Uri.parse(u);
            super.onLoadResource(v, u);
            if(u.equals(url)) {
            } else {
                /*Intent i = new Intent(Intent.ACTION_VIEW);
                i.setData(Uri.parse(u));
                startActivity(i);*/
            }
//            Log.d(TAG, "Loading resource "+url);
//            currentUrl = url;
        }
        public void onPageFinished(WebView v, String url) {
            super.onPageFinished(v, url);
            toggleHideyBar();
            //Detect TV
            UiModeManager uiModeManager = (UiModeManager) getSystemService(UI_MODE_SERVICE);
            if (uiModeManager.getCurrentModeType() == Configuration.UI_MODE_TYPE_TELEVISION) {
                eval("GamePad.virtualPad = false;");
            }
        }
        @Override
        public boolean shouldOverrideUrlLoading (WebView view, String u) {
            Log.d(TAG, u+" "+url+", "+u.equals(url));
            if(u.equals(url)) {
                view.loadUrl(u);
                return true;
            } else {
                Intent i = new Intent(Intent.ACTION_VIEW);
                i.setData(Uri.parse(u));
                startActivity(i);
                return false;
            }
        }
    }
    final class MyChromeClient extends WebChromeClient {
        //TODO STAHP LEAKING AUDIO, provide endpoints to call that
        // Add new webview in same window
        @Override
        public boolean onCreateWindow(WebView view, boolean dialog,
                                      boolean userGesture, Message resultMsg) {
            WebView childView = new WebView(getApplication());
//            WebView childView = view;

            WebSettings webSettings = body.getSettings();
            webSettings.setJavaScriptEnabled(true);
            webSettings.setSupportZoom(false);
            webSettings.setSupportMultipleWindows(true);
            webSettings.setJavaScriptCanOpenWindowsAutomatically(true);
            childView.addJavascriptInterface(new WebAppInterface(getApplicationContext()), "Android");
            childView.setWebChromeClient(new MyChromeClient());
            childView.setWebViewClient(new BridgeClient());
            childView.setLayoutParams(new WebView.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT, 0, 0));
            childView.setPadding(0,64,0,64);
            childView.setBackgroundColor(getResources().getColor(android.R.color.background_dark));
            childView.loadUrl("http://www.example.com/");
            frame.addView(childView);
            WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
            transport.setWebView(childView);
            resultMsg.sendToTarget();

            /*if(Build.VERSION.SDK_INT >= 19) {
                Log.d(TAG, "eval js");
                childView.evaluateJavascript("console.log(3)", new ValueCallback<String>() {
                    @Override
                    public void onReceiveValue(String value) {
                        Log.d(TAG, "RECEIVED VALUE");
                        Log.d(TAG, value+":");
                    }
                });
            }*/
            Log.d(TAG, "childView");
            childView.loadUrl("http://www.example.com/");
            return true;
        }

        // remove new added webview whenever onCloseWindow gets called for new webview.
        @Override
        public void onCloseWindow(WebView window) {
            frame.removeViewAt(frame.getChildCount() - 1);
            goFullscreen();
            window.destroy();
        }
        @Override
        public boolean onConsoleMessage(@NonNull ConsoleMessage cm) {
            Log.d(TAG, "console message");
            Log.d(TAG, cm.message() + " -- From line "
                    + cm.lineNumber() + " of "
                    + cm.sourceId());
            return true;
        }

    }

    /** MULTIPLAYER **/
    //This code is meant to track multiple controller inputs and map them correctly
    public class ControllerConnection {
        public ControllerConnection() {

        }
    }
    private final SparseArray<ControllerConnection> mControllers = new SparseArray<ControllerConnection>();

    @Override
    public void onInputDeviceAdded(int deviceId) {
        getShipForID(deviceId);
    }

    @Override
    public void onInputDeviceChanged(int deviceId) {

    }

    @Override
    public void onInputDeviceRemoved(int deviceId) {
        removeShipForID(deviceId);
    }
    private ControllerConnection getShipForID(int shipID) {
        ControllerConnection currentShip = mControllers.get(shipID);
        if ( null == currentShip ) {
            currentShip = new ControllerConnection();
            mControllers.append(shipID, currentShip);
        }
        return currentShip;
    }
    private void removeShipForID(int shipID) {
        mControllers.remove(shipID);
    }
}
