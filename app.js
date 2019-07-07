
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



app.set('view engine', 'ejs');

app.get("/", function(req,res){
    res.render('home')
})

io.on('connection', function(socket){
    console.log('a user connected');
    blinkLed(socket)
});

app.post("/", async function(req,res){
     res.render('blinkLed');
})

http.listen(3000,'0.0.0.0',function(){
    console.log('server on')
})