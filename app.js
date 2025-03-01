'use strict';

var express = require('express');
var path = require('path');
var http = require('http');
var WebSocket = require('ws');

var app = express();

// ������������� ����������� �����
app.use(express.static(path.join(__dirname, 'public')));

// ������� HTTP-������ � ���������� ��� � WebSocket
var server = http.createServer(app);
var wss = new WebSocket.Server({ server: server }); // ���������� �����

// ��������� ��� ������������� � ������� ����
var users = {};
var chatHistory = [];

// ��������� ����������� ������ �������
wss.on('connection', function (ws) {
    var userID;
    console.log('����� ������������ �����������.');

    // ���������� ������� ���� ������ ������������
    ws.send(JSON.stringify({ type: 'chatHistory', data: chatHistory }));

    ws.on('message', function (message) {
        var msg = JSON.parse(message);

        switch (msg.type) {
            case 'setNickname':
                userID = msg.id;
                users[userID] = { nickname: msg.data, ws: ws };
                broadcastOnlineUsers();
                break;

            case 'chatMessage':
                var chatMessage = {
                    user: users[userID].nickname,
                    message: msg.data,
                    timestamp: new Date().toLocaleTimeString()
                };
                chatHistory.push(chatMessage);
                broadcast(JSON.stringify({ type: 'chatMessage', data: chatMessage }));
                break;
        }
    });

    ws.on('close', function () {
        delete users[userID];
        broadcastOnlineUsers();
        console.log('������������ ����������.');
    });
});

// ������� ��� �������� ������ ���� ������������ �������������
function broadcast(data) {
    wss.clients.forEach(function (client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

// ������� ��� �������� ������ ������-�������������
function broadcastOnlineUsers() {
    var onlineUsers = [];
    for (var key in users) {
        if (users.hasOwnProperty(key)) {
            onlineUsers.push(users[key].nickname);
        }
    }
    broadcast(JSON.stringify({ type: 'onlineUsers', data: onlineUsers }));
}

// ������ �������
var PORT = process.env.PORT || 3000;
server.listen(PORT, function () {
    console.log('������ ������� �� ����� ' + PORT);
});
