
var rpio = require('rpio')
var app = require('express')()

var http = require('http').createServer(app);
var io = require('socket.io')(http);


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
    // buttonPress()
})

app.get('/status',function(req,res){
    res.render('status')
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
});

app.post("/", async function(req,res){
     res.render('blinkLed');
})

http.listen(3000,'0.0.0.0',function(){
    console.log('server on')
})