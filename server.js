var express = require('express')
var app = express()
var http = require('http').createServer(app)
var io = require('socket.io')(http)
var path = require('path')
var allSocket = {}
var person = {
    'Общий чат': {
        avatar: 'qunliao',
        name: 'Общий чат'
    }
}

app.get('/', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.sendFile(__dirname + '/index.html')
    let deviceAgent = req.headers["user-agent"].toLowerCase();
    let agentID = deviceAgent.match(/(iphone|ipod|ipad|android)/);
})
app.use(express.static(path.join(__dirname, '/')));
io.on('connection', (socket) => {
    console.log('---------- start ----------')
    socket.on('disconnect', () => {
        console.log('---------- end ----------')
    })
    socket.on('chatMessage', (msg) => {
        if(msg.receiver === 'Общий чат'){
            io.emit('msg', msg)
        }else{
            allSocket[msg.receiver].emit('msg', msg)
        }
        console.log(`"${msg.sender}""${msg.receiver}": ${msg.msg}`)
    })
    socket.on('login', user => {
        let name = user.name
        for(let i in person){
            if(i === name){
                io.emit('loginStatus', 0)
                return
            } 
        }
        person[name] = user
        allSocket[user.name] = socket
        io.emit('loginStatus', 1)
        console.log(`${user.name}！`)
    })

    socket.on('getUserlist', () => {
        io.emit('userlist', person)
    })
})

http.listen('9999', () => {
    console.log('Listening on: 9999')
})
