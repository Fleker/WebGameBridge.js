<!DOCTYPE html>
<!--

FACILITATES OAuth 1,1a,2 AUTHENTICATION

To link to this page in HelloJS define the redirect_uri.

This page is used for authentication as well as POST using the Iframe+form+hash communication hack.


-->
<html>
<head>
	<title>Hello, redirecting...</title>
</head>
<body>
	<script src="http://adodson.com/hello.js/dist/hello.all.min.js"></script>

	<script>
		// DEBUG
		// The sign in has failed, if the window is not returned, probably because the hash is wrong
		// Add the hash to the window for debugging purposes.
		document.body.appendChild(document.createTextNode("Failed to recognize URL query: "+window.location.href));
	</script>
</body>
</html>