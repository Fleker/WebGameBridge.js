//AUTHENTICATION SUPPORT
//Add head params
var h = document.head;
var h_html = h.innerHTML;
h_html += '<meta name="google-signin-clientid" content="'+clientId+'" />';
h_html += ' <meta name="google-signin-cookiepolicy" content="single_host_origin" /><meta name="google-signin-callback" content="signinCallback" />';
h_html += '<meta name="google-signin-scope" content="'+scopes+'" />';
h.innerHTML = h_html;
//Add Body Load
//document.body.innerHTML += '<script src="https://apis.google.com/js/client.js?onload=handleClientLoad"></script>';
document.body.innerHTML += "<div name='snackbar' class='snackbar snackbar-off'></div>";
//Need jQuery for virtual key stuff
//document.body.innerHTML += "<script src='http://code.jquery.com/jquery-2.1.3.min.js'/>";

//Default Snackbar Style
document.head.innerHTML += "<style>.snackbar { z-index:100; transition-duration: 0.5s; position:fixed; top:101%; left:35%; width:30%; height:70px; border-radius:100px; background-color:#fff; color: #333; border:solid 1px black; text-align:center; padding:16px; } .snackbar-on { top: calc(95% - 100px); } .snackbar-rich { text-align:left; padding:0px; } .snackbar-text { height:20px; }</style>";
document.head.innerHTML += "<style> .fullbleed { width:100%;height:100%;position:fixed;overflow:hidden;margin:0 }</style>";

GPGJS = {
    VERSION: "0.9.0.2",
    BUILD: 2,
    AUTHOR: "Nick Felker @HandNF"
}
console.info("Using GPG.JS version "+GPGJS.VERSION);

//GETTERS
GET = {};
var searchurl = window.location.search.substring(1);
var b = searchurl.split("&");
for(var c in b) { 
    var d = b[c].split("="); 
    GET[d[0]] = d[1]; 
}
function urlGet(q) {
    return GET[q];    
}
function urlHas(q) {
    return GET[q] !== undefined;   
}
ANDROID = urlHas("android");

function handleClientLoad() {
// Step 2: Reference the API key
    if(!ANDROID) {
        gapi.client.setApiKey(apiKey);
        window.setTimeout(checkAuth,1);
    } else {
        Android.Auth_SignIn();
    }
}

function checkAuth() {
    gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);
}

function signinCallback(r) {
    console.log(r);
}

function handleAuthResult(authResult) {
    console.log(authResult);
//    var authorizeButton = document.getElementById('authorize-button');
    if (authResult && !authResult.error) {
//      authorizeButton.style.visibility = 'hidden';
      makeApiCall();
    } else {
//        authorizeButton.style.visibility = '';
//        authorizeButton.onclick = handleAuthClick;
        try {
            console.warn("You are not logged in, please do that.");
            onNeedAuth();    
        } catch(e) {}
    }
}

//Displays a classy splash screen with a singular option to allow users to authenticate
function generateAuthSplash(id, background) { //id of the div element to be used
    var e = document.getElementById(id);
    e.style.top = "0px";
    e.style.left = "0px";
    e.style.height = "100%";
    e.style.width = "100%";
    var bg = document.createElement("div");
    bg.style.background = "url("+background+")";
    bg.style.backgroundRepeat = "no-repeat";
    bg.style.backgroundSize = "cover";
    bg.style.position = "fixed";
    bg.style.top = "0px";
    bg.style.left = "0px";
    bg.style.height = "100%";
    bg.style.width = "100%";
    bg.style['-webkit-filter'] = 'blur(7px)';
    var b = document.createElement("button");
    b.innerHTML = "GOOGLE+ SIGN-IN";
    b.id = "auth-splash-button"
    b.style.border = "solid 2px white";
    b.style.height = "100px";
    b.style.fontSize = "24pt";
    b.style.backgroundColor = "rgba(255,255,255,0.3)";
    b.style.position = "fixed";
    b.style.top = "calc(50% - 50px)";
    b.style.left = "calc(50% - 155px)";
    b.style.width = "310px";
    b.style.transitionDuration = '0.5s';
    b.style.cursor = "pointer";
    b.style.boxShadow = "black 0px 0px 10px 1px";
    b.onclick = handleAuthClick;
    e.appendChild(bg);
    e.appendChild(b);
    b.focus();
    
    //Change some styles when the screen size is small
    var mq = window.matchMedia("(max-width: 480px)");
    mq.addListener(authSplashStyle);
//    mq.onchange = function() { console.log(4); }
    authSplashStyle(mq);
}
function authSplashStyle(media) {
    console.log(media.matches, window.innerWidth);
    var b = document.getElementById('auth-splash-button');
    if(media.matches) {
        b.style.width = "160px";
        b.style.height = "40px";
        b.style.left = "calc(50% - 80px)";
        b.style.fontSize = "12pt";
    } else {
        b.style.width = "310px";
        b.style.left = "calc(50% - 155px)";
        b.style.height = "100px";
        b.style.fontSize = "24pt";
    }
}

function handleAuthClick(event) {
// Step 3: get authorization to use private data
    if(!ANDROID) {
        console.log("Get authorization to use private data");
        gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
        return false;
    } else {
        Android.Auth.SignIn();   
    }
}

// Load the API and make an API call.  Display the results on the screen.
function makeApiCall() {
  console.log("HEY - YOU ARE CONNECTED! :D");
    if(!ANDROID) {
      GooglePlayGamesConnect();
      try {
        onConnected();      
      } catch(e) {
        console.warn("Use the onConnected event to start the game after a successful connection");   
      }
    } else {
        Android.GooglePlayGamesConnect();
       try {
        onConnected();      
      } catch(e) {
        console.warn("Use the onConnected event to start the game after a successful connection");   
      }    
    }
}

//LIBRARY FUNCTIONS

//LEADERBOARD
var LeaderboardArray = {};
function Leaderboard() {
    this.iconUrl;
    this.id;
    this.isIconUrlDefault;
    this.name;
    this.order;
    
    Leaderboard.prototype.setIconUrl = function(u) {
        this.iconUrl = u;
        return this;
    }
    Leaderboard.prototype.setId = function(id) {
        this.id = id;
        return this;
    }
    Leaderboard.prototype.setIsIconDefault = function(bool) {
        this.isIconUrlDefault = bool;
        return this;
    }
    Leaderboard.prototype.setName = function(n) {
        this.name = n;
        return this;
    }
    Leaderboard.prototype.setOrder = function(n) {
        if(n == "LARGER IS BETTER")
            this.order = LEADERBOARDS.LARGER_IS_BETTER;
        else
            this.order = LEADERBOARDS.SMALLER_IS_BETTER;
    }
    Leaderboard.prototype.getName = function() {
        return this.name;   
    }
    Leaderboard.prototype.getId = function() {
        return this.id;   
    }
}

LEADERBOARDS = { ALL: "ALL", ALL_TIME: "ALL_TIME", DAILY: "DAILY", WEEKLY: "WEEKLY", PUBLIC: "PUBLIC", SOCIAL: "SOCIAL", LARGER_IS_BETTER: 1, SMALLER_IS_BETTER: 2};
function LeaderboardRequest() {
    
    this.refresh = function() {
        if(!ANDROID) {
            gapi.client.request({
            path: '/games/v1/leaderboards',
            callback: function(response) {
            // Do something interesting with the response
                    for(var i in response.items) {
                        var item = response.items[i];
                        var l = new Leaderboard();   
                        l.setIconUrl(item.iconUrl).setId(item.id).setIsIconDefault(item.isIconUrlDefault).setName(item.name).setOrder(item.order);
                        var n = l.getName().replace(/\s/g, "_");
                        LeaderboardArray[n] = l;
                    }
                }
            });   
        } else {
            Android.GPGLeaderboard.refresh();
        }
    };
    this.getList = function() {
        return LeaderboardArray;
    };
    this.getPlayerScore = function(leaderboard, timespan, ranktype, callbackfnc) {
        if(leaderboard === undefined)
            leaderboard = LEADERBOARDS.ALL;
        if(timespan === undefined && leaderboard != LEADERBOARDS.ALL)
            timespan = LEADERBOARDS.ALL_TIME;
        else if(leaderboard == this.ALL)
            timespan = LEADERBOARDS.ALL_TIME;
        if(ranktype === undefined)
            ranktype = LEADERBOARDS.PUBLIC;
        if(!ANDROID) {
            gapi.client.request({
              path: 'games/v1/players/me/leaderboards/'+leaderboard.getId()+'/scores/'+timespan,
              params: {includeRankType: ranktype},
              // You would add a body: {} argument if the method required a request body
              callback: function(response) {
                // Do something interesting with the response
                  callbackfnc(response);
              }
            });
        } else {
            Android.GPGLeaderboard_getPlayerScore(leaderboard.getId(), timespan, ranktype, callbackfnc.toString());   
        }
    };
    this.listLeaderboardScore = function(leaderboard, timespan, ranktype, callbackfnc) {
        if(ranktype === undefined)
            ranktype = LEADERBOARDS.PUBLIC;
        if(timespan === undefined)
            timespan = LEADERBOARDS.ALL_TIME;
        
        if(!ANDROID) { 
            gapi.client.request({
              path: 'games/v1/players/me/leaderboards/'+leaderboard.getId()+'/scores/'+ranktype,
              params: {timeSpan: timespan},
              // You would add a body: {} argument if the method required a request body
              callback: function(response) {
                // Do something interesting with the response
                  callbackfnc(response);
              }
            });  
        } else if(ANDROID) {
            Android.GPGLeaderboard_listLeaderboardScore(leaderboard.getId(), timespan, ranktype, callbackfnc.toString());
        }
    };
    this.update = function(leaderboard, score, callbackfnc) {
        if(!ANDROID) {
            gapi.client.request({
              path: '/games/v1/leaderboards/'+leaderboard.getId()+'/scores',
              params: {score: score},
              method: 'post',
              // You would add a body: {} argument if the method required a request body
              callback: function(response) {
                // Do something interesting with the response
                  console.log(response);
                  callbackfnc(response);
                  if(response.beatenScoreTimeSpans !== undefined && Snackbar.isEnabled()) {
                     var bsts = response.beatenScoreTimeSpans;
                     if(bsts.indexOf(LEADERBOARDS.ALL_TIME) > -1) {
                        Snackbar.makeRichToast(GPGLeaderboard.buildRichHtml(leaderboard, response.formattedScore, LEADERBOARDS.ALL_TIME));
                     } else if(bsts.indexOf(LEADERBOARDS.WEEKLY) > -1) {
                        Snackbar.makeRichToast(GPGLeaderboard.buildRichHtml(leaderboard, response.formattedScore, LEADERBOARDS.WEEKLY));
                     } else if(bsts.indexOf(LEADERBOARDS.DAILY) > -1) {
                        Snackbar.makeRichToast(GPGLeaderboard.buildRichHtml(leaderboard, response.formattedScore, LEADERBOARDS.DAILY));
                     }
                  }
              }
            });
        } else if(ANDROID) {
            Android.GPGLeaderboard_update(leaderboard.getId(), score, callbackfnc.toString());
        }
    };
    this.launchAndroid = function() {
        if(ANDROID)
            Android.launchLeaderboardsIntent();    
    }
    
    this.buildRichHtml = function(leaderboard, score, record_type) {
        return '<img src="'+leaderboard.iconUrl+'" style="height: 40px;display: inline;padding-right: 32px;padding-left: 32px;"><div style="display: inline-block;width: calc(100% - 140px);"><b style="text-transform: uppercase;font-size: 9pt;color: #555;display: inline-block;width: 100%;text-align: center;padding-top: 4px;margin-left: -32px;">New '+record_type.replace(/_/g, " ")+' record</b><br><span style="color: #555;font-size: 16pt;">'+leaderboard.getName()+'</span><br><span style="font-size: 12pt;text-transform: uppercase;color: #777;">'+score+'</span></div>';
    };
}
GPGLeaderboard = new LeaderboardRequest();

//ACHIEVEMENTS

var AchievementsArray = {};
var ACHIEVEMENTS = {STANDARD: "STANDARD", INCREMENTAL: "INCREMENTAL", HIDDEN: "HIDDEN", REVEALED: "REVEALED", UNLOCKED: "UNLOCKED"};
function Achievement() {    
    this.id;
    this.name;
    this.description;
    this.achievementType;
    this.totalSteps;
    this.formattedTotalSteps;
    this.revealedIconUrl;
    this.isRevealedIconUrlDefault;
    this.unlockedIconUrl;
    this.isUnlockedIconUrlDefault;
    this.initialState;
    this.experiencePoints;
    
    this.setId = function(id) { this.id = id;  return this;}
    this.setName = function(n) { this.name = n;  return this;}
    this.setDescription = function(d) { this.description = d;  return this;}
    this.setTotalSteps = function(t) { this.totalSteps = t;  return this;}
    this.setFormattedTotalSteps = function(f) { this.formattedTotalSteps = f;  return this;}
    this.setRevealedIconUrl = function(r) { this.revealedIconUrl = r;  return this;}
    this.setIsRevealedIconUrlDefault = function(b) { this.isRevealedIconUrlDefault = b;  return this;}
    this.setUnlockedIconUrl = function(r) { this.unlockedIconUrl = r;  return this;}
    this.setIsUnlockedIconUrlDefault = function(b) { this.isUnlockedIconUrlDefault = b; return this; }
    this.setInitialState = function(i) { 
        if(i == "HIDDEN")
            this.initialState = ACHIEVEMENTS.HIDDEN;
        else if(i == "REVEALED")
            this.initialState = ACHIEVEMENTS.REVEALED;
        else 
            this.initialState = ACHIEVEMENTS.UNLOCKED;
        return this;
    } 
    this.setAchievementType = function(a) {
        if(a == "STANDARD")
            this.achievementType = ACHIEVEMENTS.STANDARD;
        else
            this.achievementType = ACHIEVEMENTS.INCREMENTAL;
        return this;
    }
    this.setExperiencePoints = function(p) { this.experiencePoints = p; return this;}
    
    this.getName = function() { return this.name; } 
    this.getId = function() { return this.id; }
}

function AchievementRequest() {
    if(!ANDROID) {
        this.refresh = function() {
            gapi.client.request({
              path: '/games/v1/achievements',
              // You would add a body: {} argument if the method required a request body
              callback: function(response) {
                  for(i in response.items) {
                        var item = response.items[i];
                        var a = new Achievement();   
                  a.setAchievementType(item.achievementType).setDescription(item.description).setId(item.id).setName(item.name).setTotalSteps(item.totalSteps).setFormattedTotalSteps(item.formattedTotalSteps).setRevealedIconUrl(item.revealedIconUrl).setIsRevealedIconUrlDefault(item.isRevealedIconUrlDefault).setUnlockedIconUrl(item.unlockedIconUrl).setIsUnlockedIconUrlDefault(item.isUnlockedIconUrlDefault).setInitialState(item.initialState).setExperiencePoints(item.experiencePoints);
                        var n = a.getName().replace(/\s/g, "_");
                        AchievementsArray[n] = a;
                    }
              }
            });  
        };
    } else if(ANDROID) {
        Android.GPGAchievement_refresh();   
    }
    
    this.increment = function(achievement, steps, callbackfnc /* with params currSteps & newly unlocked */) {
        if(!ANDROID) {
            console.log(achievement);
            gapi.client.request({
              path: '/games/v1/achievements/'+achievement.getId()+'/increment',
              params: {stepsToIncrement: steps},
              method: 'post',
              // You would add a body: {} argument if the method required a request body
              callback: function(response) {
                // Do something interesting with the response
                  if(response.newlyUnlocked) {
                        if(Snackbar.isEnabled()) {
                            Snackbar.makeRichToast(GPGAchievements.buildRichHtml(achievement));
                        }
                  }
                  callbackfnc(response.currentSteps, response.newlyUnlocked);
              }
            });   
        } else if(ANDROID) {
            Android.GPGAchievement_increment(achievement.getId(), steps, callbackfnc.toString());
        }
    };
    
    this.getList = function() {
        return AchievementsArray;
    }
    
    this.getPlayerProgress = function(callbackfnc) {
        if(!ANDROID) {
            gapi.client.request({
              path: '/games/v1/players/me/achievements',
              // You would add a body: {} argument if the method required a request body
              callback: function(response) {
                // Do something interesting with the response
                  console.log(response);
                  callbackfnc(response);
              }
            });
        } else if(ANDROID) {
            Android.GPGAchievement_getPlayerProgress(callbackfnc.toString());
        }   
    };
    this.launchAndroid = function() {
        if(ANDROID)
            Android.launchAchievementsIntent();    
    }
    
    this.reveal = function(achievement, callbackfnc /* with param of currentstate */) {
        //https://developers.google.com/games/services/web/api/achievements/reveal
        if(!ANDROID) {
            gapi.client.request({
              path: '/games/v1/achievements/'+achievement.getId()+'/reveal',
              method: 'post',
              // You would add a body: {} argument if the method required a request body
              callback: function(response) {
                // Do something interesting with the response
                  console.log(response);
                  var param = ACHIEVEMENTS.REVEALED;          
                  if(response.currentState == "UNLOCKED")
                      param = ACHIEVEMENTS.UNLOCKED;
                  callbackfnc(response.currentState);
              }
            });  
        } else if(ANDROID) {
            Android.GPGAchievement_reveal(achievement.getId(), callbackfnc.toString());
        }
    };
    
    this.setSteps = function(achievement, minSteps, callbackfnc /* currentSteps, newlyUnlocked */) {
        if(!ANDROID) {
            gapi.client.request({
              path: '/games/v1/achievements/'+achievement.getId()+'/setStepsAtLeast',
              params: {steps: steps},
              method: 'post',
              // You would add a body: {} argument if the method required a request body
              callback: function(response) {
                // Do something interesting with the response
                  if(response.newlyUnlocked) {
                        if(Snackbar.isEnabled()) {
                            Snackbar.makeRichToast(GPGAchievements.buildRichHtml(achievement));
                        }
                  }
                  callbackfnc(response.currentSteps, response.newlyUnlocked);
              }
            }); 
        } else if(ANDROID) {
            Android.GPGAchievement_setSteps(achievement.getId(), minSteps, callbackfnc.toString());
        }
    }
    
    this.unlock = function(achievement, callbackfnc /* newlyUnlocked */) {
        if(!ANDROID) {
            gapi.client.request({
              path: '/games/v1/achievements/'+achievement.getId()+'/unlock',
              method: 'post',
              // You would add a body: {} argument if the method required a request body
              callback: function(response) {
                // Do something interesting with the response
                  if(response.newlyUnlocked) {
                        if(Snackbar.isEnabled()) {
                            Snackbar.makeRichToast(GPGAchievements.buildRichHtml(achievement));
                        }
                  }
                  callbackfnc(response.newlyUnlocked);
              }
            });  
        } else if(ANDROID) {
            console.log("Yo will soon unlock "+achievement.name);
            Android.GPGAchievement_unlock(achievement.getId(), callbackfnc.toString());
        }
    }
    
    this.buildRichHtml = function(achievement) {
        return '<img src="'+achievement.unlockedIconUrl+'" style="height: 40px;display: inline;padding-right: 32px;padding-left: 32px;"><div style="display: inline-block;width: calc(100% - 140px);"><b style="text-transform: uppercase;font-size: 9pt;color: #555;display: inline-block;width: 100%;text-align: center;padding-top: 4px;margin-left: -32px;">Unlocked</b><br><span style="color: #555;font-size: 16pt;">'+achievement.getName()+'</span><br><span style="font-size: 8pt;text-transform: uppercase;color: #777;">'+achievement.description+'</span><span style="font-size: 8pt;color: #0a0;display: inline-block;padding-left: 16px;">+'+achievement.experiencePoints+'</span></div>';
    };

    this.getAchievementById = function(ach_id) {
        for(a in AchievementsArray) {
            var item = AchievementsArray[a];
            if(item.getId() == ach_id) {
                return item;   
            }
        }
    }
}
GPGAchievements = new AchievementRequest();

//Will initialize and cache stuff
function GooglePlayGamesConnect() {
    GPGLeaderboard.refresh();
    GPGAchievements.refresh();
}

//SNACKBAR API
function SnackBarUtils() {
    this.LENGTH_SHORT = 3000;
    this.LENGTH_LONG = 6000;
    this.SNACKBAR_ENABLED = !ANDROID;
    this.makeToast = function(text, length) {
        if(length === undefined)
            length = this.LENGTH_SHORT;
        var bar = document.getElementsByClassName('snackbar')[0];
        bar.innerHTML = text;
        bar.className = "snackbar snackbar-on snackbar-text";
        setTimeout(hideSnackbar, length);
    };
    this.makeRichToast = function(text, length) {
        if(length === undefined)
            length = this.LENGTH_LONG;
        var bar = document.getElementsByClassName('snackbar')[0];
        bar.innerHTML = text;
        bar.className = "snackbar snackbar-on snackbar-rich";
        setTimeout(hideSnackbar, length);
    };
    this.element = function() {
        return document.getElementsByClassName('snackbar')[0];
    }   
    this.isEnabled = function() {
        return this.SNACKBAR_ENABLED;   
    }
}
function hideSnackbar() {
    var bar = document.getElementsByClassName('snackbar')[0];
    bar.className = bar.className.replace("-on", "-off");
    setTimeout(function(b) {
        bar.className = "snackbar snackbar-off";
    }, 1000, bar);
}
Snackbar = new SnackBarUtils();

//Virtual Gamepad
function Key(keycode, ctrl, shft, alt) {
    this.key = keycode;
    this.ctrl = ctrl || false;
    this.shift = shft || false;
    this.meta = alt || false;
}
function VirtualGamepad() {
    this.KEYS = {
        W: new Key(87),
        A: new Key(0),
        S: new Key(83),
        D: new Key(0),
        Enter: new Key(13),
        Spacebar: new Key(32),
        Left: new Key(37),
        Up: new Key(38),
        Right: new Key(39),
        Down: new Key(40),
    };
    this.pressKey = function(key) {
        var e = $.Event('keydown');
        e.which = key.key; 
        e.keyCode = key.key;
        e.ctrl = key.ctrl;
        e.shift = key.shift;
        e.meta = key.meta;
        $(document).trigger(e);
    }
    this.releaseKey = function(key) {
        var e = $.Event('keyup');
        e.which = key.key; 
        e.keyCode = key.key;
        e.ctrl = key.ctrl;
        e.shift = key.shift;
        e.meta = key.meta;
        $(document).trigger(e);
    }
    this.tapKey = function(key) {
        //Both presses and releases soon after
        this.pressKey(key);
        setTimeout(function(vgp, k) { 
            vgp.releaseKey(k);
        }, 100, this, key);
    }
    this.keyspressed = {};
    this.keyhistory = [];
    this.HISTORY_LENGTH = 5;
    this.isDown = function(key) {
        if(key.ctrl !== undefined) {
            return this.keyspressed[key.key+"_"+key.ctrl+"_"+key.shift+"_"+key.meta] !== undefined;
        } else {
            //An array of keys -- this can also be a single key which is in of itself a series of keys
            var down = true;
            for(i in key) {
                var k = key[i];
                down = down && (this.keyspressed[k.key+"_"+k.ctrl+"_"+k.shift+"_"+k.meta] !== undefined);
            }   
            return down;
        }
    }
    this.wasDone = function(keyList) {
        //An array of keys that needed to be pressed in an exact order to elicit a response
        var down = true;
        var index = parseInt(this.keyhistory.length - keyList.length);
        for(i in keyList) {
            i = parseInt(i);
            key = keyList[i];
//            console.log(i, key, down, key.key+"_"+key.ctrl+"_"+key.shift+"_"+key.meta, parseInt(index+i), GamePad.keyhistory[index+i]);
            down = down && (this.keyhistory[index+i] == key.key+"_"+key.ctrl+"_"+key.shift+"_"+key.meta);
        }
        return down;
    }
    this.addKey = function(name, def) {
        this.KEYS[name] = def;   
    }
    this.virtualPad = ANDROID;
    this.setVirtualPad = function(b) {
        this.virtualPad = b;   
    }
    this.needVirtualPad = function() {
        return this.virtualPad;       
    }
    this.hideVirtualPad = function() {
        var list = document.getElementsByClassName("virtual-key");
        for(i=0;i<list.length;i++) {
            var e = list[i];
            e.style.display = 'none';
        }
    }
    this.showVirtualPad = function(force) {
        //By default this will only do something if the virtualpad is enabled
        if(force || this.virtualPad) {
            var list = document.getElementsByClassName("virtual-key");
            for(i=0;i<list.length;i++) {
                var e = list[i];
                e.style.display = 'block';
//                e.onmousedown = e.ontouchstart = e.onmspointerdown = GamePad.pressKey(GamePad.KEYS[e.getAttribute('data-key')]);
                e.onmousedown = e.ontouchstart = e.onmspointerdown = this.input;
                e.onmouseup = e.ontouchend = e.onmspointerup = this.export;
            }      
        }
    }
    this.input = function(ev) {
        console.log(ev);
        GamePad.pressKey(GamePad.KEYS[ev.target.getAttribute('data-key')]);
    }
    this.export = function(ev) {
        GamePad.releaseKey(GamePad.KEYS[ev.target.getAttribute('data-key')]);
    }
    this.alert = function(ev) {
        console.warn(ev);   
    }
}
GamePad = new VirtualGamepad();

$(document).on('keydown', function(e) {
    console.log(e);
    GamePad.keyspressed[e.which+"_"+e.ctrl+"_"+e.shift+"_"+e.meta] = true;
    try {
        onKeyDown(e.which);   
    } catch(e) {
        
    }
//    return false;
});
$(document).on('keyup', function(e) {
    delete GamePad.keyspressed[e.which+"_"+e.ctrl+"_"+e.shift+"_"+e.meta];
    
    GamePad.keyhistory.push(e.which+"_"+e.ctrl+"_"+e.shift+"_"+e.meta);
    if(GamePad.keyhistory.length > GamePad.HISTORY_LENGTH)
        GamePad.keyhistory.splice(0,1);
});
/** MENU APIS **/
function Menu(name, id) {
    this.id = id;
    this.name = name;
    this.getId = function() {
        return this.id;   
    }
}
MENUS = {MAIN: "main", PAUSE: "pause", AUTH: "auth", GAME: "game", SPLASH: "splash"};
function MenuManager() {
    this.menus = {};
    this.currMenu;
    this.setMenus = function(json) { //Provide a JSON of ids
        for(i in json) {
            this.menus[i] = new Menu(i, json[i]);   
        }
    }
    this.current = function() {
        return this.currMenu;
    }
    this.open = function(menu_name) {
        if(this.menus[menu_name] === undefined)
            return;
        
        this.currMenu = menu_name;
        for(i in this.menus) {
            if(this.menus[i].getId() !== undefined)
                document.getElementById(this.menus[i].getId()).style.display = "none";
        }   
//        console.log(this.menus, menu_name);
        if(this.menus[menu_name].getId() !== undefined)
            document.getElementById(this.menus[menu_name].getId()).style.display = "block";
        
        if(menu_name == MENUS.GAME)
            GamePad.showVirtualPad(false);
        else
            GamePad.hideVirtualPad();
    }
}
menus = new MenuManager();

/** SPLASH SCREEN **/
function SplashScreens() {
    this.screens = [];
    this.period = 2500;
    this.previous = MENUS.AUTH;
    this.setScreens = function(array) {
        this.screens = array;
    }
    this.execute = function(id) {
        if(id < this.screens.length) {
            menus.open(MENUS.SPLASH);
            //Is image or something fancier?
            Splashes.dom.style.backgroundImage = Splashes.screens[id];
            id++;
            setTimeout(function(id) {                                
                Splashes.execute(id);
            }, this.period, id)
        } else {
            if(Splashes.previous !== undefined)
                menus.open(Splashes.previous);
            else
                document.getElementById('splash-screen').style.display = 'none'
        }
    }
    this.dom = document.createElement("div");
    this.dom.id = "splash-screen";
    this.dom.style.position = "fixed";
    this.dom.style.top = "0px";
    this.dom.style.left = "0px";
    this.dom.style.width = "100%";
    this.dom.style.height = "100%";    
    this.dom.style.backgroundSize = "cover";
    document.getElementsByTagName('body')[0].appendChild(this.dom);
}
Splashes = new SplashScreens();

$(document).ready(function() {
    menus.menus[MENUS.SPLASH] = new Menu(MENUS.SPLASH, "splash-screen");
    Splashes.previous = menus.current();
    Splashes.execute(0);
});

