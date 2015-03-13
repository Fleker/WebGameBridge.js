<?php
    header('X-Frame-Options: GOFORIT'); 
?>
<html>
<head>
    <script src="https://github.com/craftyjs/Crafty/releases/download/0.6.3/crafty.js"></script>
<!--    <script src="http://adodson.com/hello.js/dist/hello.all.js"></script>-->
    <style>
        @import url(http://fonts.googleapis.com/css?family=Roboto);
    </style>
    <style>
        #mainMenu button {
            width: 200px;
            background-color: #fff;
            border: solid 1px #333;
            box-shadow: black 0px 0px 4px 0px;
            margin: 16px;
            height: 40px;
            font-weight: 600;
            letter-spacing: 1px;
            border-radius: 100px;
            padding: 7px;   
        }
        button:focus {
            box-shadow: blue 0px 0px 4px 0px;
            outline: none;
            color: blue;
        }
    </style>
</head>
<body class='fullbleed'>
    <div id='mainMenu' style="display:none;">
        <button onclick="startGame(true)" data-r="1" data-c="1">Local Multiplayer</button>
        <button onclick="startGame(false)" data-r="1" data-c="2">Play Computer</button><br>
        <button onclick="displayLeaderboard()" data-r="2" data-c="1">Display Leaderboard</button>
        <button onclick="displayAchievements()" data-r="2" data-c="2">Display Achievements</button>
<!--        <button onclick="hello('google').login();console.log('!');">G+</button>-->
    </div>
    <button id="authorize-button" style="position:fixed;left:30%;top:40%;" data-r="2" data-c="3">Authorize</button>
    <div id='pauseMenu' style='display:none;position:fixed;top:5%;left:5%;'>
        <button onclick='mainMenu()'>Main Menu</button>
    </div>
    <div id='fakeModalBox' style='position:fixed;display:none;top: 30%;Submitheight: 35%;left: 30%;width: 35%;border: solid 2px black;padding: 4px;box-shadow: rgba(0,0,0,.5) 0px 2px 15px 0px;'>
        <span onclick='document.getElementById("fakeModalBox").style.display = "none"'>X</span>
        <div id='fakeModal'>
        
        </div>
    </div>
<script>    
    var clientId = '38446245957-3d6r70i48c1hid0d7v4uerms6hhu4jma.apps.googleusercontent.com';
    var apiKey = 'AIzaSyDVu7p12a5e9-Er7H75DXquQgjUP9JpSD4';
    var scopes = 'https://www.googleapis.com/auth/games https://www.googleapis.com/auth/plus.me';

function onConnected() {
    mainMenu();   
}
function onNeedAuth() {
    $('#authorize-button').focus();   
}
function mainMenu() {
    Crafty.stop(true);
    document.getElementById('mainMenu').style.display = "block";
    document.getElementById('pauseMenu').style.display = "none";
    inGame = false;
    r = 1;
    c = 1;
    $('button[data-r="'+r+'"][data-c="'+c+'"]').focus();

}
function displayLeaderboard() {
    document.getElementById('fakeModalBox').style.display = "block";
    GPGLeaderboard.listLeaderboardScore(GPGLeaderboard.getList().Time, undefined, undefined, function(r) {
        console.log(r);
        document.getElementById('fakeModal').innerHTML = "<b>Fastest Games Leaderboard of All Time</b><br>";
        for(i in r.items) {
            var item = r.items[i];
            document.getElementById('fakeModal').innerHTML += "- "+item.scoreString+"<br>";
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
    starttime = new Date().getTime();
    MAX_POINTS = 3; //Customize, also do time-based?
    document.getElementById('mainMenu').style.display = "none";
    Crafty.init(window.innerWidth, window.innerHeight);
    Crafty.background('#eee');
    console.log('!!!3');
//Walls
Crafty.e("Wall1, Wall, 2D, DOM, Color").attr({x:0,y:0,h:window.innerHeight, w:1}).color(0,0,0); //  |
    console.log('!!!4');
Crafty.e("Wall2, Wall, 2D, DOM, Color").attr({x:window.innerWidth,y:0,h:window.innerHeight, w:1}).color(0,0,0); //   |
Crafty.e("Wall3, Wall, 2D, DOM, Color").attr({x:0,y:0,h:1, w:window.innerWidth}).color(0,0,0);// -
Crafty.e("Wall4, Wall, 2D, DOM, Color").attr({x:0,y:window.innerHeight,h:1, w:window.innerWidth}).color(0,0,0); // _
//Paddles
p1 = Crafty.e("Paddle, 2D, DOM, Color, Multiway, Object, Collision")
    .color('rgb(255,0,0)')
    .attr({ x: 20, y: window.innerHeight/2, w: 10, h: window.innerHeight/6, speed_mod: 1, paddleid:1, cpu: !multiplayer, difficulty: 210})
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
    .color('rgb(0,255,0)')
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
    .color('rgb(0,0,255)')
    .attr({ x: window.innerWidth/2, y: window.innerHeight/2, w: 10, h: 10,
            dX: Math.pow(-1,(Crafty.math.randomInt(1,2)))*Crafty.math.randomInt(2, 5),
            dY: Crafty.math.randomInt(2, 5) })
    .bind('EnterFrame', function () {
        if (this.x > window.innerWidth-this.w) {
            Crafty.pause(true);
            this.x = window.innerWidth/2;
            this.dX = Math.pow(-1,(Crafty.math.randomInt(1,2)))*Crafty.math.randomInt(2, 5);
            setTimeout("Crafty.pause(false)", 1000);
            Crafty("LeftPoints").each(function () {
                this.text(++this.points + " ") });
        }
        if (this.x < this.w) {
            Crafty.pause(true);
            this.x = window.innerWidth/2;
            this.dX = Math.pow(-1,(Crafty.math.randomInt(1,2)))*Crafty.math.randomInt(2, 5);
            setTimeout("Crafty.pause(false)", 1000);
            Crafty("RightPoints").each(function () {
                this.text(++this.points + " ") });
        }

        this.x += this.dX;
        this.y += this.dY;
    })
    .onHit('Object', function() {
        this.dX *= -1;
    })
    .onHit('Wall', function() {
        this.dY *= -1;
    })
p1.bind('EnterFrame', function() {
       i
    });

//Score boards
Crafty.e("LeftPoints, DOM, 2D, Text")
    .attr({ x: 80, y: 20, w: 100, h: 20, points: 0 })
    .text("0 ")
    .textFont({family:"Roboto", size:"16pt"})
    .bind('Invalidate', function() {
        //Check score
//        console.log(this.points);
        if(this.points >= MAX_POINTS)
            gameWon(1);
    });
Crafty.e("RightPoints, DOM, 2D, Text")
    .attr({ x: window.innerWidth-100, y: 20, w: 100, h: 20, points: 0 })
    .text("0 ")
    .textFont({family:"Roboto", size:"16pt"})
    .bind('Invalidate', function() {
        //Check score
//        console.log(this.points);
        if(this.points >= MAX_POINTS)
            gameWon(2);
    });
    
    Crafty.pause(true);
    
    if(multiplayer) {
        whois_p1 = Crafty.e("2D, DOM, Text, Whois").attr({ x: 20, y: 60 }).text("P1 (User)").textFont({family:"Roboto", size:"24pt"});   
    } else {     
        whois_p1 = Crafty.e("2D, DOM, Text, Whois").attr({ x: 20, y: 60 }).text("CPU").textFont({family:"Roboto", size:"24pt"});   
    }
    whois_p2 = Crafty.e("2D, DOM, Text").attr({ x: window.innerWidth-160, y: 60 }).text("P2 (You)").textFont({family:"Roboto", size:"24pt"});    
    whois_countdown = Crafty.e("2D, DOM, Text, Countdown").attr({x: window.innerWidth/2-20, y: window.innerHeight/2 - 20}).text("3").textFont({family:"Roboto", size:"24pt"});
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
    endtime = new Date().getTime();
    console.log(endtime - starttime,"ms");
    Snackbar.makeToast("Player "+plyr+" wins!");
    Crafty.pause(true);
    //To confirm
    setTimeout("Crafty.pause(true)", 2000);
    setTimeout(function() {
        //Update leaderboard count
        GPGLeaderboard.update(GPGLeaderboard.getList().Time, 99997, function(r) { console.log(r) });

        //Update achievements
        if(plyr == 1) {
            //Loss   
            GPGAchievements.unlock(GPGAchievements.getList().Cheer_Up, function(got) {});
            GPGAchievements.increment(GPGAchievements.getList().Practice_Makes_Perfecct, 1, function(currSteps, newlyUnlocked) {});
            console.log("Yo loss");
        } else {
            //Win
            console.log("Yo won");
            GPGAchievements.unlock(GPGAchievements.getList()['High-Five'], function(got) {});
            GPGAchievements.increment(GPGAchievements.getList().Grindr, 1, function(currSteps, newlyUnlocked) {});
            GPGAchievements.increment(GPGAchievements.getList().Winning_Streak, 1, function(currSteps, newlyUnlocked) {});
        } 
    }, 4000);
    document.getElementById('pauseMenu').style.display = "block";
}
</script>
<script src='http://code.jquery.com/jquery-2.1.3.min.js'></script>
<script src="game_auth_lib.js"></script>
<script src="https://apis.google.com/js/client.js?onload=handleClientLoad"></script>
<script>
function onKeyDown(code) {
    if(!inGame) {
        switch(code) {
            case 37:
                c--;
                break;
            case 38: 
                r--;
                break;
            case 39:
                c++;
                break;
            case 40:
                r++;
                break;
        }
        console.log("Focus "+r+", "+c);
        $('button[data-r="'+r+'"][data-c="'+c+'"]').focus();
    }
}
</script>
</body>
</html>