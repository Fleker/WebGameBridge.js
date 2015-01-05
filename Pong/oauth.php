<head>
    <script src="https://github.com/craftyjs/Crafty/releases/download/0.6.3-beta/crafty.js"></script>
    <style>
        @import url(http://fonts.googleapis.com/css?family=Roboto);
    </style>
</head> 
<body>
<!--Add a button for the user to click to initiate auth sequence -->
    <button id="authorize-button" style="visibility: hidden">Authorize</button>
    <script>
        var clientId = '38446245957-3d6r70i48c1hid0d7v4uerms6hhu4jma.apps.googleusercontent.com';
        var apiKey = 'AIzaSyDVu7p12a5e9-Er7H75DXquQgjUP9JpSD4';
        var scopes = 'https://www.googleapis.com/auth/games https://www.googleapis.com/auth/plus.me';
    </script>
    <script src="game_auth_lib.js"></script>
    <script src="https://apis.google.com/js/client.js?onload=handleClientLoad"></script>
</body>