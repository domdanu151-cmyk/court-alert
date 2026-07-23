const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('send-alert', (data) => {
        console.log('🚨 ได้รับแจ้งเหตุ:', data);
        io.emit('emergency-alert', {
            room: data.room,
            eventType: data.eventType,
            timestamp: new Date().toLocaleTimeString('th-TH')
        });
    });
});

server.listen(3000, () => {
    console.log('==================================================');
    console.log('  ✅ ระบบพร้อมใช้งานเรียบร้อยแล้ว!');
    console.log('  📺 จอศูนย์ควบคุม: http://localhost:3000/dashboard.html');
    console.log('  🚨 หน้าแจ้งเหตุ:   http://localhost:3000/sender.html');
    console.log('==================================================');
});