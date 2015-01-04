//Add head params
var h = document.head;
var h_html = h.innerHTML;
h_html += '<meta name="google-signin-clientid" content="'+clientId+'" />';
h_html += ' <meta name="google-signin-cookiepolicy" content="single_host_origin" /><meta name="google-signin-callback" content="signinCallback" />';
h_html += '<meta name="google-signin-scope" content="'+scopes+'" />';
h.innerHTML = h_html;
//Add Body Load
//document.body.innerHTML += '<script src="https://apis.google.com/js/client.js?onload=handleClientLoad"></script>';


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
        // Step 4: Load the Google+ API
        /*gapi.client.load('plus', 'v1').then(function() {
          // Step 5: Assemble the API request
          var request = gapi.client.plus.people.get({
            'userId': 'me'
          });
          // Step 6: Execute the API request
          request.then(function(resp) {
            var heading = document.createElement('h4');
            var image = document.createElement('img');
            image.src = resp.result.image.url;
            heading.appendChild(image);
            heading.appendChild(document.createTextNode(resp.result.displayName));

            document.getElementById('content').appendChild(heading);
          }, function(reason) {
            console.log('Error: ' + reason.result.error.message);
          });
        });*/
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
                    var n = l.getName().replace(/\s/, "_");
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
          path: '/games/v1/leaderboards/'+leaderboard.getName()+'/scores',
          params: {leaderboardId: leaderboard.getName(), score: score},
          method: 'post',
          // You would add a body: {} argument if the method required a request body
          callback: function(response) {
            // Do something interesting with the response
              console.log(response);
              callbackfnc(response);
          }
        });   
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
              a.setAchievementType(item.achievementType).setDescription(item.description).setId(item.id).setName(item.name).setTotalSteps(item.totalSteps).setFormattedTotalSteps(item.formattedTotalSteps).setRevealedIconUrl(item.revealedIconUrl).setIsRevealedIconUrlDefault(item.isRevealedIconUrlDefault).setUnlockedIconUrl(item.unlockedIconUrl).setIsUnlockedIconUrlDefault(item.isUnlockedIconUrlDefault).setInitialState(item.initialState);
                    var n = a.getName().replace(/\s/, "_");
                    AchievementsArray[n] = l;
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
              console.log(response);
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
              console.log(response);
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
              console.log(response);
              callbackfnc(response.newlyUnlocked);
          }
        });  
    };
}
GPGAchievements = new AchievementRequest();

//Will initialize and cache stuff
function GooglePlayGamesConnect() {
    GPGLeaderboard.refresh();
    GPGAchievements.refresh();
}
