const {Server} = require('socket.io');

const io = new Server(5000,{
    cors:true
});

let users = [];
io.on('connection', socket => {
    console.log(`${socket.id} is connected`);
    // users.push(socket);

    socket.on('user:request', data => {
        const { email, roomNumber } = data;
        users.push({email, roomNumber, id: socket.id});
        io.to(roomNumber).emit('user:join', {email, id: socket.id});
        // socket.emit('user')
        console.log(users);
        socket.join(roomNumber);
        io.to(socket.id).emit('user:joined', {email, roomNumber});
        // console.log(email, roomNumber);
    })

    socket.on('user:call',({to, offer}) => {
        io.to(to).emit('incomming:call', { from:socket.id, offer });
    } )

    socket.on('peer:nego:needed',({ offer, to }) => {
        io.to(to).emit('peer:nego:needed', { from:socket.id, offer });
    })

    socket.on('peer:nego:done', ({ to, ans }) => {
        io.to(to).emit('peer:nego:final', { from:socket.id, ans });
    })

    socket.on('call:accepted', ({ to, answer }) => {
        io.to(to).emit('call:accepted', { from: socket.id, answer });
    })

    socket.on('draw', ({ x,y }) => {
        socket.broadcast.emit('onDraw', { x,y });
    })

    socket.on('down', ({x,y}) => {
        socket.broadcast.emit('onDown', {x,y});
    })
});
