const express = require('express');
const app = express();
const { getUser, getUsersInRoom, removeUser, addUser } = require('./Users');
const cors = require('cors');
const server = require('http').createServer(app);
//const ENDOINT = 'https://idanchat.netlify.app/';
const io = require('socket.io')(server, {
	cors: {
		origin: 'https://idanchat.netlify.app',
		methods: ['GET', 'POST'],
		allowedHeaders: ['my-custom-header'],
		credentials: true,
	},
});
const router = require('./router');

app.use(cors());

app.use(router);
io.on('connect', socket => {
	socket.on('join', ({ name, room }, callback) => {
		const { error, user } = addUser({ id: socket.id, name, room });

		if (error) return callback(error);

		socket.join(user.room);

		socket.emit('message', {
			user: 'admin',
			text: `${user.name}, welcome to room ${user.room}.`,
		});
		socket.broadcast
			.to(user.room)
			.emit('message', { user: 'admin', text: `${user.name} has joined!` });

		io.to(user.room).emit('roomData', {
			room: user.room,
			users: getUsersInRoom(user.room),
		});
	});

	socket.on('sendMessage', (message, callback) => {
		const user = getUser(socket.id);

		io.to(user.room).emit('message', { user: user.name, text: message });
	});

	socket.on('disconnect', () => {
		const user = removeUser(socket.id);

		if (user) {
			io.to(user.room).emit('message', {
				user: 'Admin',
				text: `${user.name} has left.`,
			});
			io.to(user.room).emit('roomData', {
				room: user.room,
				users: getUsersInRoom(user.room),
			});
		}
	});
});
server.listen(process.env.PORT || 5000, () =>
	console.log(`Server has started.`)
);
