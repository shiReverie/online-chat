document.addEventListener('DOMContentLoaded', function () {
    var nicknameModal = document.getElementById('nickname-modal');
    var nicknameForm = document.getElementById('nickname-form');
    var nicknameInput = document.getElementById('nickname-input');

    var chatHistory = document.getElementById('chat-history');
    var messageForm = document.getElementById('message-form');
    var messageInput = document.getElementById('message-input');

    var usersList = document.getElementById('users-list');

    var ws;
    var userID = Date.now();

    // Отображение модального окна для ввода ника
    nicknameModal.style.display = 'flex';

    nicknameForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var nickname = nicknameInput.value.trim();
        if (nickname) {
            // Подключаемся к WebSocket серверу
            ws = new WebSocket('ws://' + location.host);

            ws.onopen = function () {
                ws.send(JSON.stringify({ type: 'setNickname', data: nickname, id: userID }));
            };

            ws.onmessage = function (event) {
                var msg = JSON.parse(event.data);

                switch (msg.type) {
                    case 'chatHistory':
                        msg.data.forEach(function (message) {
                            addMessage(message);
                        });
                        break;

                    case 'chatMessage':
                        addMessage(msg.data);
                        break;

                    case 'onlineUsers':
                        updateUsersList(msg.data);
                        break;
                }
            };

            nicknameModal.style.display = 'none';
        }
    });

    messageForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var message = messageInput.value.trim();
        if (message && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'chatMessage', data: message }));
            messageInput.value = '';
        }
    });

    function addMessage(msg) {
        var messageElement = document.createElement('div');
        messageElement.classList.add('message');

        var userElement = document.createElement('span');
        userElement.classList.add('message-user');
        userElement.textContent = msg.user;

        var textElement = document.createElement('span');
        textElement.classList.add('message-text');
        textElement.textContent = ': ' + msg.message;

        var timeElement = document.createElement('span');
        timeElement.classList.add('message-time');
        timeElement.textContent = msg.timestamp;

        messageElement.appendChild(userElement);
        messageElement.appendChild(textElement);
        messageElement.appendChild(timeElement);

        chatHistory.appendChild(messageElement);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function updateUsersList(users) {
        usersList.innerHTML = '';
        users.forEach(function (user) {
            var userItem = document.createElement('li');
            userItem.textContent = user;
            usersList.appendChild(userItem);
        });
    }
});
