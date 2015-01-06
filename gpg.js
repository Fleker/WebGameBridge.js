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

function handleClientLoad() {
// Step 2: Reference the API key
gapi.client.setApiKey(apiKey);
window.setTimeout(checkAuth,1);
}

function checkAuth() {
gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);
}

function signinCallback(r) {
    console.log(r);
}

function handleAuthResult(authResult) {
  console.log(authResult);
var authorizeButton = document.getElementById('authorize-button');
if (authResult && !authResult.error) {
  authorizeButton.style.visibility = 'hidden';
  makeApiCall();
} else {
  authorizeButton.style.visibility = '';
  authorizeButton.onclick = handleAuthClick;
}
}

function handleAuthClick(event) {
// Step 3: get authorization to use private data
gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
return false;
}

// Load the API and make an API call.  Display the results on the screen.
function makeApiCall() {
  console.log("HEY - YOU ARE CONNECTED! :D");
  GooglePlayGamesConnect();
  try {
    onConnected()      
  } catch(e) {
    console.warn("Use the onConnected event to start the game after a successful connection");   
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
        gapi.client.request({
        path: '/games/v1/leaderboards',
        callback: function(response) {
        // Do something interesting with the response
                for(i in response.items) {
                    var item = response.items[i];
                    var l = new Leaderboard();   
                    l.setIconUrl(item.iconUrl).setId(item.id).setIsIconDefault(item.isIconUrlDefault).setName(item.name).setOrder(item.order);
                    var n = l.getName().replace(/\s/g, "_");
                    LeaderboardArray[n] = l;
                }
            }
        });   
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
            
        
        gapi.client.request({
          path: 'games/v1/players/me/leaderboards/'+leaderboard.getId()+'/scores/'+timespan,
          params: {includeRankType: ranktype},
          // You would add a body: {} argument if the method required a request body
          callback: function(response) {
            // Do something interesting with the response
              callbackfnc(response);
          }
        });   
    };
    this.listLeaderboardScore = function(leaderboard, timespan, ranktype, callbackfnc) {
        if(ranktype === undefined)
            ranktype = LEADERBOARDS.PUBLIC;
        if(timespan === undefined)
            timespan = LEADERBOARDS.ALL_TIME;
        
        gapi.client.request({
          path: 'games/v1/players/me/leaderboards/'+leaderboard.getId()+'/scores/'+ranktype,
          params: {timeSpan: timespan},
          // You would add a body: {} argument if the method required a request body
          callback: function(response) {
            // Do something interesting with the response
              callbackfnc(response);
          }
        });  
    };
    this.update = function(leaderboard, score, callbackfnc) {
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
    };
    
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
    
    this.increment = function(achievement, steps, callbackfnc /* with params currSteps & newly unlocked */) {
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
    };
    
    this.getList = function() {
        return AchievementsArray;
    }
    
    this.getPlayerProgress = function(callbackfnc) {
        gapi.client.request({
          path: '/games/v1/players/me/achievements',
          // You would add a body: {} argument if the method required a request body
          callback: function(response) {
            // Do something interesting with the response
              console.log(response);
              callbackfnc(response);
          }
        });
    };
    
    this.reveal = function(achievement, callbackfnc /* with param of currentstate */) {
        //https://developers.google.com/games/services/web/api/achievements/reveal
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
    };
    
    this.setSteps = function(achievement, minSteps, callbackfnc /* currentSteps, newlyUnlocked */) {
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
    };
    
    this.unlock = function(achievement, callbackfnc /* newlyUnlocked */) {
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
    };
    
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
    this.SNACKBAR_ENABLED = true;
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
    this.isDown = function(key) {
        return this.keyspressed[e.which+"_"+e.ctrl+"_"+e.shift+"_"+e.meta] !== undefined;
    }
}
GamePad = new VirtualGamepad();

$(document).on('keydown', function(e) {
//    console.log(e);
    GamePad.keyspressed[e.which+"_"+e.ctrl+"_"+e.shift+"_"+e.meta] = true;
//    return false;
});
$(document).on('keyup', function(e) {
    delete GamePad.keyspressed[e.which+"_"+e.ctrl+"_"+e.shift+"_"+e.meta]; 
});
//setInterval("console.log(keyspressed)", 2000);

/*document.addEventListener("keypress", function(e) { 
    console.log(e); 
}, true)*/
