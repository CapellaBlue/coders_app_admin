var express = require('express');
var app     = express();
var port    = 3001;

//dont need routes, but we do need a static folder

app.use(express.static('public'));

app.listen(port, function(){
    console.log("======================");
    console.log("Admin running on port: " + port);
    console.log("======================");
});
