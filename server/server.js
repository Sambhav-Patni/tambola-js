var express  = require('express')
  , fs       = require('fs')
  , http     = require('http')
  , app      = express()
  , cors 	   = require('cors')
  , host     = 'localhost'
  , server   = http.createServer(app).listen(process.env.PORT || 3000)//, host)
  , io       = require('socket.io')(server, { origins: '*:*'})
;
//const PORT = process.env.PORT || 3000;
//app.use(express.static(__dirname + "/../client"));
//app.use(cors());
//app.options('*', cors());
app.use(function (req, res){  
console.log(req.url);
  if(req.url.includes("sendHeartbeat")){
	sendHeartbeat();
	res.status(200).send("Current Sequence: " +ticketArray.join(' - '));
  }
else if(req.url.includes("chat")){
	chatArray[chatArray.length] = req.query.chat;
	for (var i in Socket) {
      		Socket[i].emit('heartbeat', {'chat': req.query.chat});
    	}
	res.status(200).send("Char Sequence: " +chatArray.join(' <br/>:  '));
}
else{
  res.sendFile(req.url, { root: __dirname })
  }
})  
//.listen(PORT, () => console.log(`Listening on ${PORT}`));

//random number
var ticketArray = []
  , fileName = "tambola.log"
  , Socket = []
  , secondsLeft = 10
  ;

var writeLog = function (str) {
  str += "\n";
  fs.appendFile(fileName, str, function (err) {
    if (err) {
      throw err;
    }
  });
};

var generateRandom = function () {
  var rand = Math.random() * 90;
  var randomNumber = Math.floor(rand + 1);
	while(ticketArray.indexOf(randomNumber) != -1){
	  console.log("Retrying after repeat: "+ randomNumber);
	  rand = Math.random() * 90;
	  randomNumber = Math.floor(rand + 1);
	  //console.log("New Number: "+ randomNumber);
  	}
  if (ticketArray.indexOf(randomNumber) === -1 ) {
    ticketArray[ticketArray.length] = randomNumber;
    return randomNumber;
  } else {
    console.info("Progress: Repeated Random Number is : " + randomNumber);
  }
  return true;
};

console.info("Server Started on " + host + ":"+process.env.PORT);
//writeLog("Start: Server Started on " + host + ":8081");

var sendHeartbeat = function () {
  var randomNumber = false;
  if (ticketArray.length <= 89) {
    randomNumber = generateRandom();
  } else {
    console.info("Progress: Ticket List sequence is :" + ticketArray.join(' - '));
    console.info("End: Game Over.");
    for (var i in Socket) {
      Socket[i].emit('heartbeat', {'message': "Game Over :)"});
    }
  }

  if (randomNumber === false) {
  } else if (randomNumber === true) {
  } else {
    console.info("Progress: Random Number is : " + randomNumber);
    for (var i in Socket) {
      Socket[i].emit('heartbeat', {'num': randomNumber});
    }
  }
};

io.sockets.on('connection', function (socket) {
  Socket.push(socket);
  console.log("socket connected");
  var IpAddress = socket.handshake.address;
  console.info("Join: User Number :" + Socket.length + ", IP Address :" + IpAddress);

  for (var i in Socket) {
    Socket[i].emit('heartbeat', {'previous': ticketArray});
  }
  socket.on('disconnect', function () {
    console.log('socket connection disconnected');
    console.info("Left: IP Address :" + IpAddress);
  });
});

var showTimer = function () {
  if (secondsLeft !== 0) {
    for (var i in Socket) {
      Socket[i].emit('heartbeat', {'timer': secondsLeft});
    }
    secondsLeft--;
  }
};

var interval = setInterval( function () {
  if (secondsLeft == 0) {
    //clearInterval(interval);
    //setInterval(sendHeartbeat, 6000);
    return false;
  }
  showTimer();
}, 1000); 
