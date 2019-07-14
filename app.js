
var rpio = require('rpio')
var app = require('express')()

var http = require('http').createServer(app);
var io = require('socket.io')(http);
var five = require("johnny-five");
var board = new five.Board();


function johnnyBlink(){
    // The board's pins will not be accessible until
    // the board has reported that it is ready
    board.on("ready", function() {
        console.log("Ready!");
        this.pinMode(13, five.Pin.OUTPUT);
        this.digitalWrite(13, 1);
        this.on("exit", function() {
            this.digitalWrite(13,0)
        });
    });
}

function johnnyStatus(){
    console.log("Ready!");
    board.on("ready", function() {
        // Assuming a button is attached to pin 9
        this.pinMode(9, five.Pin.INPUT);
        this.digitalRead(9, function(value) {
            console.log(value);
        });
    });
}
async function blinkLed(socket){

    function delay(t) {
        return new Promise(resolve => {
            setTimeout(resolve, t);
        });
    }
rpio.open(12, rpio.OUTPUT, rpio.LOW);
for (var i = 0; i < 5; i++) {
        /* On for 1 second */
         rpio.write(12, rpio.HIGH);
         rpio.sleep(1);
         socket.emit('data','high');
         await delay(1000);
    
        /* Off for half a second (500ms) */
        rpio.write(12, rpio.LOW);
         rpio.msleep(500);
        await socket.emit('data','low')
        await delay(500);
          
        }
}

function checkLed(data){
    rpio.open(12, rpio.OUTPUT, rpio.LOW);
    console.log('rpio open')
    if(data){
        console.log('ON')
        rpio.write(12, rpio.HIGH);
    }else{
        console.log('OFF')
        rpio.write(12, rpio.LOW);
    }
}

function status(socket){
    rpio.open(15, rpio.INPUT, rpio.PULL_UP);
    setInterval(function(){
        var status = rpio.read(15)
        console.log(status)
        socket.emit('status',status)
    },1000)
}
app.set('view engine', 'ejs');

app.get("/", function(req,res){
    res.render('home')
})

app.get("/event", function(req,res){
    res.render("eventTest")
})

app.get('/status',function(req,res){
    res.render('status')
})

app.get('/johnnyblink',function(req,res){
    res.render('johnnyBlink')
})

app.get('/johnnystatus',function(res,res){
    res.render('johnnyStatus')
})
io.on('connection', function(socket){
    socket.on('data',function(){
        console.log('a user connected');
        blinkLed(socket)
    })

    socket.on("check",function(data){
        console.log('Check data:'+data);
        checkLed(data);
    })
    socket.on("status",function(){
        status(socket)
    })
    socket.on('blink',function(){
        console.log('johnnyblink loaded');
        board.on("connect",function(){
            console.log('board connected')
        })
        johnnyBlink()
    })
    socket.on('jStatus',function(){
        console.log('Johnny Status loaded');
        board.on("connect",function(){
            console.log('board connected')
        })
        johnnyStatus()
    })
});

app.post("/", async function(req,res){
     res.render('blinkLed');
})

http.listen(3000,'0.0.0.0',function(){
    console.log('server on')
})