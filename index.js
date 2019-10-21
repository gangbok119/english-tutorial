// require
const express = require('express');
const express_session = require('express-session');
const morgan = require('morgan');
const cookie_parser = require('cookie-parser');
const passport = require('passport');
const ejs = require('ejs');

const path = require('path');
const db = require('./models');
const passportConfig = require('./passport');

const wordRouter = require('./routes/word');
const userRouter = require('./routes/user');
require('dotenv').config();

// 서버 실행
const app = express();

// 미들웨어 세팅

db.sequelize.sync()
passportConfig();

// 화면 engine을 ejs로 설정
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
// app.use(express.static(path.join(__dirname, 'static')));
app.use(morgan('dev'));
app.use(cookie_parser(process.env.COOKIE_SECRET));
app.use(express_session({
  resave:false,
  saveUninitialized:false,
  secret: process.env.COOKIE_SECRET,
  cookie:{
    httpOnly:true,
    secure:false
  }
}));
app.use(express.json());
app.use(express.urlencoded({ extended:true}));

// passport 부분
app.use(passport.initialize());
app.use(passport.session());

app.use('/', wordRouter);
app.use('/user', userRouter);



// //소켓서버
var conf = { 
  port: 8888,
  debug: false,
  dbPort: 6379,
  dbHost: '127.0.0.1',
  dbOptions: {},
  mainroom: 'MainRoom'
};
// External dependencies
var express2 = require('express'),
  http = require('http'),
  events = require('events'),
  _ = require('underscore'),
  sanitize = require('validator').sanitize;
// HTTP Server configuration & launch
var app2 = express2(),
  server = http.createServer(app2);
  server.listen(conf.port);

// Express app configuration
//app2.use(express2.bodyParser());
app2.use(express2.static(__dirname + '/static'));

var io = require('socket.io')(server);
var redis = require('socket.io-redis');
io.adapter(redis({ host: conf.dbHost, port: conf.dbPort }));

var rb = require('redis').createClient(conf.dbPort,conf.dbHost);

// Logger configuration
var logger = new events.EventEmitter();
logger.on('newEvent', function(event, data) {
  // Console log
  console.log('%s: %s', event, JSON.stringify(data));
  
});

// Only authenticated users should be able to use protected methods
var requireAuthentication = function(req, res, next) {
  // TODO
  next();
};

// Send a message to all active rooms
var sendBroadcast = function(text) {
  _.each(io.nsps['/'].adapter.rooms, function(sockets, room) {
      var message = {'room':room, 'username':'ServerBot', 'msg':text, 'date':new Date()};
      io.to(room).emit('newMessage', message);
  });
  logger.emit('newEvent', 'newBroadcastMessage', {'msg':text});
};


// Broadcast message to all connected users
app2.post('/api/broadcast/', requireAuthentication, function(req, res) {
  sendBroadcast(req.body.msg);
  res.send(201, "Message sent to all rooms");
}); 

// ***************************************************************************
// Socket.io events
// ***************************************************************************
var usercount = 1;

//client 커넥션 시도.
io.sockets.on('connection', function(socket) {
var usernick = 'user'+usercount++;
  // Welcome message on connection
  socket.emit('connected', 'Welcome to the chat server');
  logger.emit('newEvent', 'userConnected', {'socket':socket.id});

  // Store user data in db
  rb.hset([socket.id, 'connectionDate', new Date()], redis.print);
  rb.hset([socket.id, 'socketID', socket.id], redis.print);
  rb.hset([socket.id, 'username', usernick], redis.print);


  // Join user to 'MainRoom'
  socket.join(conf.mainroom);
  logger.emit('newEvent', 'userJoinsRoom', {'socket':socket.id, 'room':conf.mainroom});
  // Confirm subscription to user
  socket.emit('subscriptionConfirmed', {'room':conf.mainroom});

console.log(socket.id);
  // Notify subscription to all users in room
  var data = {'room':conf.mainroom, 'username':usernick, 'msg':'----- Joined the room -----', 'id':socket.id};
  io.to(conf.mainroom).emit('userJoinsRoom', data);

  // User wants to subscribe to [data.rooms]
  socket.on('subscribe', function(data) {
      // Get user info from db
      rb.hget([socket.id, 'username'], function(err, username) {

          // Subscribe user to chosen rooms
          _.each(data.rooms, function(room) {
              room = room.replace(" ","");
              socket.join(room);
              logger.emit('newEvent', 'userJoinsRoom', {'socket':socket.id, 'username':username, 'room':room});

              // Confirm subscription to user
              socket.emit('subscriptionConfirmed', {'room': room});
      
              // Notify subscription to all users in room
              var message = {'room':room, 'username':username, 'msg':'----- Joined the room -----', 'id':socket.id};
              io.to(room).emit('userJoinsRoom', message);
          });
      });
  });

  // User wants to unsubscribe from [data.rooms]
  socket.on('unsubscribe', function(data) {
      // Get user info from db
      rb.hget([socket.id, 'username'], function(err, username) {
      
          // Unsubscribe user from chosen rooms
          _.each(data.rooms, function(room) {
              if (room != conf.mainroom) {
                  socket.leave(room);
                  logger.emit('newEvent', 'userLeavesRoom', {'socket':socket.id, 'username':username, 'room':room});
              
                  // Confirm unsubscription to user
                  socket.emit('unsubscriptionConfirmed', {'room': room});
      
                  // Notify unsubscription to all users in room
                  var message = {'room':room, 'username':username, 'msg':'----- Left the room -----', 'id': socket.id};
                  io.to(room).emit('userLeavesRoom', message);
              }
          });
      });
  });

  // User wants to know what rooms he has joined
  socket.on('getRooms', function(data) {
      socket.emit('roomsReceived', socket.rooms);
      logger.emit('newEvent', 'userGetsRooms', {'socket':socket.id});
  });

  // Get users in given room
  socket.on('getUsersInRoom', function(data) {
      var usersInRoom = [];
      var socketsInRoom = _.keys(io.nsps['/'].adapter.rooms[data.room]);
      for (var i=0; i<socketsInRoom.length; i++) {
          rb.hgetall(socketsInRoom[i], function(err, obj) {
      usersInRoom.push({'room':data.room, 'username':data.username, 'id':data.socketID});
              //usersInRoom.push({'room':data.room, 'username':obj.username, 'id':obj.socketID});
              // When we've finished with the last one, notify user
              if (usersInRoom.length == socketsInRoom.length) {
                  socket.emit('usersInRoom', {'users':usersInRoom});
              }
          });
      }
  });

  // User wants to change his nickname
  socket.on('setNickname', function(data) {
      // Get user info from db
      rb.hget([socket.id, 'username'], function(err, username) {

          // Store user data in db
          rb.hset([socket.id, 'username', data.username], redis.print);
          logger.emit('newEvent', 'userSetsNickname', {'socket':socket.id, 'oldUsername':username, 'newUsername':data.username});

          // Notify all users who belong to the same rooms that this one
          _.each(socket.rooms, function(room) {
              if (room) {
                  var info = {'room':room, 'oldUsername':username, 'newUsername':data.username, 'id':socket.id};
                  io.to(room).emit('userNicknameUpdated', info);
        console.log('userNicknameUpdated', info);
              }
          });
      });
  });

  // New message sent to group
  socket.on('newMessage', function(data) {
  //alert(data);
  console.log('newMessage',data);
      rb.hgetall(socket.id, function(err, obj) {
          if (err) return logger.emit('newEvent', 'error', err);
          // Check if user is subscribed to room before sending his message
          if (_.contains(_.values(socket.rooms), data.room)) {
              var message = {'room':data.room, 'username':obj.username, 'msg':data.msg, 'date':new Date()};
              // Send message to room
              io.to(data.room).emit('newMessage', message);
      
              logger.emit('newEvent', 'newMessage', message);
          }
      });
  });

  // Clean up on disconnect
  socket.on('disconnect', function() {
      
      // Get current rooms of user
      var rooms = socket.rooms;
      
      // Get user info from db
      rb.hgetall(socket.id, function(err, obj) {
          if (err) return logger.emit('newEvent', 'error', err);
          logger.emit('newEvent', 'userDisconnected', {'socket':socket.id, 'username':obj.username});

          // Notify all users who belong to the same rooms that this one
          _.each(rooms, function(room) {
              if (room) {
                  var message = {'room':room, 'username':obj.username, 'msg':'----- Left the room -----', 'id':obj.socketID};
                  io.to(room).emit('userLeavesRoom', message);
              }
          });
      });
  
      // Delete user from db
      rb.del(socket.id, redis.print);
  });
});



// 에러 처리



// 포트 열기
app.listen(process.env.PORT, () => {
    console.log(`server is running on ${process.env.PORT}`);
  });