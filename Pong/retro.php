<?php
    header('X-Frame-Options: GOFORIT'); 
?>
<html>
<head>
    <script src="https://github.com/craftyjs/Crafty/releases/download/0.6.3/crafty.js"></script>
    <style>
        @import url(http://fonts.googleapis.com/css?family=Roboto);
    </style>
    <title>Epic Table Tennis</title>
</head>
<body class='fullbleed'>
    <style>
        #mainMenu {
            position: fixed;
            text-align:center;
            bottom: 5%;   
            width:100%;
        }
        #mainMenu button, #pauseMenu button {
            width: 200px;
            margin: 16px;
            height: 40px;
            font-weight: 600;
            letter-spacing: 1px;
            border-radius: 100px;
            padding: 7px;   
            transition-duration:0.5s;
        }
        button:focus {
            box-shadow: blue 0px 0px 4px 0px;
            outline: none;
            color: blue;
        }
        body {
            background-color: rgb(182, 205, 118);
            font-family:monospace;
        }
        button, .snackbar {
            font-family:monospace;
        }
        .snackbar {
              z-index: 100;
              transition-duration: 0.5s;
              position: fixed;
              left: 35%;
              width: 30%;
              border-radius: 0px; 
              background-color: #efefef;
              font-size: 11pt;
              color: #333;
              border: dotted 2px black;
              text-align: center;
              padding: 16px;   
        }
        .virtual-key {
            position: fixed;
            top: calc(95% - 60px);
            width: 100px;
            background-color: rgba(255,0,0,.3);
            height: 40px;
            z-index: 3;
            text-align: center;
            padding-top: 20px;
        }
        #pauseMenu {
            position:fixed;
            width:40%;
            text-align:center;
            top:40%;
            left:30%;
            z-index:1;
            background-color: white;
        }
        @media (max-width:800px) {
            #pauseMenu {
                position:fixed;
                width:80%;
                text-align:center;
                top:40%;
                left:10%;
                z-index:1;
                background-color: white;
            }
            .snackbar {
                left: 10%;
                width: 70%;   
            }
        }
        #fakeModalBox {
            position:fixed;
            display:none;
            top: 30%;
            height: 35%;
            left: 30%;
            width: 35%;
            border: solid 2px black;
            padding: 4px;
            box-shadow: rgba(0,0,0,.5) 0px 2px 15px 0px;
            background-color:white;
        }
        .title {
            font-size:28pt;   
            transition-duration:0.5s;
        }
        .subtitle {
            font-size:16pt;   
            transition-duration:0.5s;
        }
        @media (max-height: 600px) {
            .title {
                font-size:16pt;   
            }
            .subtitle {
                font-size:12pt;   
            }
            #mainMenu button, #pauseMenu button {
                height: 20px;
                padding:0px;
            }   
            #mainMenu {
                bottom:0%;
            }
        }
    </style>
    <div id='mainMenu' style="display:none;">
        <!-- TODO Get font sizes changed based on the media queries -->
        <span class='title'>EPIC TABLE TENNIS</span><br><span class='subtitle'>FELKERTECH - made with <a href="https://github.com/Fleker/GooglePlayGames.js" target="_blank">WEBGAMINGBRIDGE.JS</a></span>
        <br><span class='subtitle'>MUSIC PROVIDED BY <a href="http://willdevelopgamesforfood.com/music.html" target="_blank">ZakChaos</a></span>
        <br>
        <button onclick="startGame(true)" data-r="0" data-c="0">Local Multiplayer</button><br>
        <button onclick="startGame(false)" data-r="1" data-c="0">Play Computer</button><br>
        <button onclick="menus.open(MENUS.LEADERBOARD)" data-r="2" data-c="0">Display Leaderboard</button><br>
        <button onclick="menus.open(MENUS.ACHIEVEMENTS)" data-r="3" data-c="0">Display Achievements</button>
<!--        <button onclick="hello('google').login();console.log('!');">G+</button>-->
    </div>
    <div id='authMenu'>
    
    </div>
    <div id='pauseMenu' style='display:none'>
        <div style="text-align:center;" class='subtitle'>PAUSED</div>
        <button onclick='onResume()' id='resume' data-r="0" data-c="0">Resume Game</button><br>
        <button onclick='menus.open("main")' id='gotoMain' data-r="1" data-c="0">Main Menu</button>
    </div>
    <div id='fakeModalBox' style=''>
        <span onclick='menus.open("main")'>X</span>
        <div id='fakeModal'>
        
        </div>
    </div>
    <div class='virtual-key' data-key="Up" style='left:40px'>
        UP
    </div>
    <div class='virtual-key' data-key="Down" style='left:calc(100% - 140px)'>
        DOWN
    </div>
<script>    
    var clientId = '38446245957-3d6r70i48c1hid0d7v4uerms6hhu4jma.apps.googleusercontent.com';
    var apiKey = 'AIzaSyDVu7p12a5e9-Er7H75DXquQgjUP9JpSD4';
    var scopes = 'https://www.googleapis.com/auth/games https://www.googleapis.com/auth/plus.me';
    var menus_array = {main: "mainMenu", pause: "pauseMenu", auth: "authMenu", game: undefined, achievements: "fakeModalBox", leaderboard: "fakeModalBox"};
    var splashes = [];

function onConnected() {
    menus.setMenus(menus_array);
    menus.getMenu(MENUS.MAIN).onOpen = function() {
        mainMenu();  
    };
    menus.getMenu(MENUS.PAUSE).onOpen = function() {
        onPause();  
    };
    menus.getMenu(MENUS.ACHIEVEMENTS).onOpen = function() {
        displayAchievements();
    };
    menus.getMenu(MENUS.LEADERBOARD).onOpen = function() {
        displayLeaderboard()
    };
    menus.open(MENUS.MAIN);
}
function onNeedAuth() {
    generateAuthSplash("authMenu", "http://img.wonderhowto.com/img/62/01/63528429515533/0/play-game-boy-advance-game-boy-color-games-your-ipad-iphone-no-jailbreaking.w654.jpg");
    menus.open("auth");
}
function mainMenu() {
    Crafty.stop(true);
    inGame = false;
    AudioPlayer.stopAllAudio();
}
//Called from Android
function onPause() {
    Crafty.pause(true);
    $('#resume').focus();
}
function onResume() {
    menus.open("game");
    Crafty.pause(false);
}
function displayLeaderboard() {
        document.getElementById('fakeModalBox').style.display = "block";
        GPGLeaderboard.listLeaderboardScore(GPGLeaderboard.getList().Time, undefined, undefined, function(r) {
            console.log(r);
            document.getElementById('fakeModal').innerHTML = "<b>Fastest Games Leaderboard of All Time</b><br>";
            for(i in r.items) {
                var item = r.items[i];
                document.getElementById('fakeModal').innerHTML += item.formattedScoreRank+" - "+item.formattedScore+" - "+item.player.displayName+"<br>";
            }
            GPGLeaderboard.getPlayerScore(GPGLeaderboard.getList().Time, undefined, undefined, function(r) { 
                console.log(r);
                document.getElementById('fakeModal').innerHTML += "<br><br>(Personal Best: "+r.items[0].scoreString+" - You are ranked "+r.items[0].publicRank.formattedRank+")";
            });
        });
}
function displayAchievements() {
        document.getElementById('fakeModalBox').style.display = "block";
        GPGAchievements.getPlayerProgress(function(r) {
            document.getElementById('fakeModal').innerHTML = "<b>Achievements</b><br>";
            for(i in r.items) {
                var item = r.items[i];
                var ach = GPGAchievements.getAchievementById(item.id);
                if(item.achievementState == ACHIEVEMENTS.UNLOCKED) {
                   document.getElementById('fakeModal').innerHTML += "[x] "+ach.getName()+"<br>";
                } else if(item.achievementState == ACHIEVEMENTS.REVEALED) {
                    if(item.currentSteps !== undefined) {
                        document.getElementById('fakeModal').innerHTML += "["+item.currentSteps+"/"+ach.formattedTotalSteps+"] "+ach.getName()+"<br>";
                    } else {
                        document.getElementById('fakeModal').innerHTML += "[ ] "+ach.getName()+"<br>";
                    }
                } else if(item.achievementState = ACHIEVEMENTS.HIDDEN) {
                   document.getElementById('fakeModal').innerHTML += "[ ] ???<br>";
                }
            }
        })
}
    
function startGame(multiplayer) {
    inGame = true;
    MusicPlayer.startMusic();
    starttime = new Date().getTime();
    MAX_POINTS = 3; //Customize, also do time-based?
    menus.open("game");
    Crafty.init(window.innerWidth, window.innerHeight);
    Crafty.background('rgb(182, 205, 118)');
    console.log('!!!3');
//Walls
Crafty.e("Wall1, Wall, 2D, DOM, Color").attr({x:0,y:0,h:window.innerHeight, w:1}).color(0,0,0); //  |
    console.log('!!!4');
Crafty.e("Wall2, Wall, 2D, DOM, Color").attr({x:window.innerWidth,y:0,h:window.innerHeight, w:1}).color(0,0,0); //   |
Crafty.e("Wall3, Wall, 2D, DOM, Color").attr({x:0,y:0,h:1, w:window.innerWidth}).color(0,0,0);// -
Crafty.e("Wall4, Wall, 2D, DOM, Color").attr({x:0,y:window.innerHeight,h:1, w:window.innerWidth}).color(0,0,0); // _
//Paddles
p1 = Crafty.e("Paddle, 2D, DOM, Color, Multiway, Object, Collision")
    .color('rgb(204,10,11)')
    .attr({ x: 20, y: window.innerHeight/2, w: 10, h: window.innerHeight/6, speed_mod: 1, paddleid:1, cpu: !multiplayer, difficulty: 160}) /*difficulty: lower is better */
    .multiway(Math.round(window.innerHeight/60), { W: -90, S: 90 })
    .onHit('Wall3', function() {
        this.y = 0;
    })
    .onHit('Wall4', function() {
        this.y = window.innerHeight - this.h;
    })
    .bind('keypress-up', function() {
        this.y -= Math.round(window.innerHeight/60);
    })
    .bind('keypress-down', function() {
        this.y += Math.round(window.innerHeight/60);
    })
    .bind('EnterFrame', function() {
        if(this.cpu) {
           var y = this.y;
           var cpu = this;
            Crafty("Ball").each(function() {
                var h = this.y;
                if(y > h && this.x < window.innerWidth/2)
                    cpu.y -= window.innerHeight/cpu.difficulty/*-Crafty.math.randomInt(15,30)/cpu.difficulty*/;
                else if(this.x < window.innerWidth/2)
                    cpu.y += window.innerHeight/cpu.difficulty/*-Crafty.math.randomInt(15,30)/cpu.difficulty*/;
                else {
//                    cpu.y += Math.pow(-1,Crafty.math.randomInt(1,2))*window.innerHeight/cpu.difficulty/4;
                    cpu.y += (this.y - cpu.y)/cpu.difficulty/2;
                }
            })  
        } else {
            if(GamePad.isDown(GamePad.KEYS.W))
                this.trigger('keypress-up');
            if(GamePad.isDown(GamePad.KEYS.S))
                this.trigger('keypress-down'); 
        }
    })
    .enableControl()

p2 = Crafty.e("Paddle, 2D, DOM, Color, Multiway, Object, Collision")
    .color('rgb(107, 138, 255)')
    .attr({ x: window.innerWidth-40, y: window.innerHeight/2, w: 10, h: window.innerHeight/6, speed_mod: 1, paddleid:2 })
    .multiway(Math.round(window.innerHeight/60), { UP_ARROW: -90, DOWN_ARROW: 90 })
    .onHit('Wall3', function() {
//        console.log(':o');
        this.y = 0;
    })
    .onHit('Wall4', function() {
        this.y = window.innerHeight - this.h;
    })
    .bind('keypress-up', function() {
        this.y -= Math.round(window.innerHeight/60);
    })
    .bind('keypress-down', function() {
        this.y += Math.round(window.innerHeight/60);
    })
    .bind('EnterFrame', function() {
        if(GamePad.isDown(GamePad.KEYS.Up))
            this.trigger('keypress-up');
        if(GamePad.isDown(GamePad.KEYS.Down))
            this.trigger('keypress-down');
    })
    .enableControl()

if(!multiplayer)
    p1.disableControl();
//Create stage objects
//function - parameter is the stage name, which does crafty setup

//Ball
Crafty.e("2D, DOM, Color, Collision, Ball")
    .color('rgb(7,5,8)')
    .attr({ x: window.innerWidth/2, y: window.innerHeight/2, w: 15, h: 15,
            dX: Math.pow(-1,(Crafty.math.randomInt(1,2)))*Crafty.math.randomInt(3, 5),
            dY: Crafty.math.randomInt(4, 5) })
    .bind('EnterFrame', function () {
        if (this.x > window.innerWidth-this.w) {
            Crafty.pause(true);
            this.x = window.innerWidth/2;
            this.dX = Math.pow(-1,(Crafty.math.randomInt(1,2)))*Crafty.math.randomInt(3, 5);
            setTimeout("Crafty.pause(false)", 1000);
            Crafty("LeftPoints").each(function () {
                this.text(++this.points + " ") });
        }
        if (this.x < this.w) {
            Crafty.pause(true);
            this.x = window.innerWidth/2;
            this.dX = Math.pow(-1,(Crafty.math.randomInt(1,2)))*Crafty.math.randomInt(3, 5);
            setTimeout("Crafty.pause(false)", 1000);
            Crafty("RightPoints").each(function () {
                this.text(++this.points + " ") });
        }
        if(!inGame)
            menus.open("pause");
        this.x += this.dX;
        this.y += this.dY;
    })
    .onHit('Object', function() {
        this.dX *= -1;
        this.dX += (this.dX<0)?-.05:.05;
        this.dY += (this.dY<0)?-.05:.05;

        this.x += this.dX;
    })
    .onHit('Wall', function() {
        this.dY *= -1;
    })
p1.bind('EnterFrame', function() {
       
    });

//Score boards
Crafty.e("LeftPoints, DOM, 2D, Text")
    .attr({ x: 80, y: 20, w: 100, h: 20, points: 0 })
    .text("0 ")
    .textFont({family:'Courier New', size:"16pt"})
    .bind('Invalidate', function() {
        //Check score
//        console.log(this.points);
        if(this.points >= MAX_POINTS)
            gameWon(1);
    });
Crafty.e("RightPoints, DOM, 2D, Text")
    .attr({ x: window.innerWidth-100, y: 20, w: 100, h: 20, points: 0 })
    .text("0 ")
    .textFont({family:'Courier New', size:"16pt"})
    .bind('Invalidate', function() {
        //Check score
//        console.log(this.points);
        if(this.points >= MAX_POINTS)
            gameWon(2);
    });
    
    Crafty.pause(true);
    
    if(multiplayer) {
        whois_p1 = Crafty.e("2D, DOM, Text, Whois").attr({ x: 20, y: 60 }).text("P1 (User)").textFont({family:'Courier New', size:"24pt"});   
    } else {     
        whois_p1 = Crafty.e("2D, DOM, Text, Whois").attr({ x: 20, y: 60 }).text("CPU").textFont({family:'Courier New', size:"24pt"});   
    }
    whois_p2 = Crafty.e("2D, DOM, Text").attr({ x: window.innerWidth-160, y: 60 }).text("P2 (You)").textFont({family:'Courier New', size:"24pt"});    
    whois_countdown = Crafty.e("2D, DOM, Text, Countdown").attr({x: window.innerWidth/2-20, y: window.innerHeight/2 - 20}).text("3").textFont({family:'Courier New', size:"24pt"});
    setTimeout(function() {
        Crafty.pause(false);
        Crafty("Countdown").each(function() { this.text('2');})
        Crafty.pause(true);
    }, 1000);
    setTimeout(function() {
        Crafty.pause(false);
        Crafty("Countdown").each(function() { this.text('1');})
        Crafty.pause(true);
    }, 2000);
    setTimeout(function() {
        Crafty.pause(false);
        whois_p1.undraw();
        whois_p2.undraw();
        whois_countdown.undraw();
    }, 3000);
        
    Snackbar.makeToast("Get "+MAX_POINTS+" Points to Win! Good Luck!");
    
    /*$('body').off().on('keypress', function(e) {
        if(e.which == 119) {
            p1.trigger('keypress-w');
        } else if(e.which == 115) {
            p1.trigger('keypress-s');
        }
    });*/
}
function gameWon(plyr) {
    MusicPlayer.stopMusic();
    endtime = new Date().getTime();
    console.log(endtime - starttime,"ms");
    Snackbar.makeToast("Player "+plyr+" wins!");
    Crafty.pause(true);
    //To confirm
    setTimeout("Crafty.pause(true)", 2000);
    setTimeout(function() {
        //Update leaderboard count
        

        //Update achievements
        if(plyr == 1) {
            //Loss   
            GPGAchievements.unlock(GPGAchievements.getList().Cheer_Up, function(got) {});
            GPGAchievements.increment(GPGAchievements.getList().Practice_Makes_Perfect, 1, function(currSteps, newlyUnlocked) {});
            console.log("Yo loss");
        } else {
            //Win
            console.log("Yo won");
            GPGAchievements.unlock(GPGAchievements.getList()['High-Five'], function(got) {});
            GPGAchievements.increment(GPGAchievements.getList().Grindr, 1, function(currSteps, newlyUnlocked) {});
            GPGAchievements.increment(GPGAchievements.getList().Winning_Streak, 1, function(currSteps, newlyUnlocked) {});
            GPGLeaderboard.update(GPGLeaderboard.getList().Time, endtime - starttime, function(r) { console.log(r) });
        } 
    }, 4000);
    menus.open("pause");
    inGame = false;
}
</script>
<script src='http://code.jquery.com/jquery-2.1.3.min.js'></script>
<script src="game_auth_lib.js"></script>
<script src="https://apis.google.com/js/client.js?onload=handleClientLoad"></script>
<script>
MusicPlayer.initPlaylist('battle.ogg', 'battle.ogg');
//Splashes.setScreens([]);
function onKeyDown(code) {
    if(menus.current() == MENUS.MAIN) {
        switch(code) {
            case 37:
                menus.c--;
                break;
            case 38: 
                menus.r--;
                break;
            case 39:
                menus.c++;
                break;
            case 40:
                menus.r++;
                break;
        }
        if(menus.c > 0)
            menus.c = 0;
        if(menus.c < 0)
            menus.c = 0;
        if(menus.r > 3)
            menus.r = 3;
        if(menus.r < 0)
            menus.r = 0;
        console.log("Focus "+menus.r+", "+menus.c);
        $('button[data-r="'+menus.r+'"][data-c="'+menus.c+'"]').focus();
    }
    if(menus.current() == MENUS.PAUSE) {
        switch(code) {
            case 37:
                menus.c--;
                break;
            case 38: 
                menus.r--;
                break;
            case 39:
                menus.c++;
                break;
            case 40:
                menus.r++;
                break;
        }
        if(menus.c > 0)
            menus.c = 0;
        if(menus.c < 0)
            menus.c = 0;
        if(menus.r > 1)
            menus.r = 1;
        if(menus.r < 0)
            menus.r = 0;
        console.log("Focus "+menus.r+", "+menus.c);
        $('button[data-r="'+menus.r+'"][data-c="'+menus.c+'"]').focus();
    }
}
</script>
</body>
</html>