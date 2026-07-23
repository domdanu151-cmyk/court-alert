const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// หน้าแจ้งเหตุ (Sender) - เข้าหน้าแรกได้ทันที
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>แจ้งเหตุฉุกเฉิน - ศาล</title>
    <style>
        body { font-family: Tahoma, sans-serif; text-align: center; padding: 20px; background-color: #f4f4f9; }
        .btn { width: 100%; max-width: 400px; padding: 25px; margin: 10px 0; font-size: 22px; font-weight: bold; border-radius: 12px; border: none; cursor: pointer; color: white; }
        .red { background-color: #e74c3c; }
        .yellow { background-color: #f39c12; }
        .blue { background-color: #3498db; }
        select { padding: 12px; font-size: 20px; margin-bottom: 20px; width: 100%; max-width: 400px; border-radius: 8px; }
    </style>
</head>
<body>
    <h2>🚨 ปุ่มแจ้งเหตุฉุกเฉิน</h2>
    <label><b>เลือกห้องพิจารณาคดี:</b></label><br>
    <select id="roomSelect">
        <option value="ห้องพิจารณาคดี 701">ห้องพิจารณาคดี 701</option>
        <option value="ห้องพิจารณาคดี 702">ห้องพิจารณาคดี 702</option>
        <option value="ห้องพิจารณาคดี 801">ห้องพิจารณาคดี 801</option>
    </select>
    <hr style="max-width: 400px;">
    <button class="btn red" onclick="sendAlert('🔴 เหตุด่วน / ทำร้ายร่างกาย')">🔴 ทำร้ายร่างกาย / ทะเลาะวิวาท</button><br>
    <button class="btn yellow" onclick="sendAlert('🟡 จำเลยพยายามหลบหนี')">🟡 จำเลยพยายามหลบหนี</button><br>
    <button class="btn blue" onclick="sendAlert('🔵 ต้องการกำลังเสริมด่วน')">🔵 ต้องการกำลังเสริม</button>

    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io();
        function sendAlert(eventType) {
            const room = document.getElementById('roomSelect').value;
            if(confirm('ยืนยันการแจ้งเหตุ?\\n' + room + '\\n' + eventType)) {
                socket.emit('send-alert', { room, eventType });
                alert('ส่งสัญญาณแจ้งเหตุไปยังศูนย์ควบคุมแล้ว');
            }
        }
    </script>
</body>
</html>
    `);
});

// หน้าจอศูนย์ควบคุม (Dashboard)
app.get('/dashboard', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <title>ศูนย์ควบคุมตำรวจศาล</title>
    <style>
        body { font-family: Tahoma, sans-serif; background-color: #111827; color: white; padding: 20px; text-align: center; }
        .alert-box { background-color: #dc2626; padding: 40px; border-radius: 20px; margin-top: 30px; display: none; animation: blink 0.8s infinite; border: 4px solid white; }
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
        .ack-btn { padding: 20px 40px; font-size: 24px; background-color: #16a34a; color: white; border: none; border-radius: 12px; cursor: pointer; margin-top: 25px; font-weight: bold; }
        .status-ok { color: #4ade80; font-size: 24px; margin-top: 40px; }
    </style>
</head>
<body>
    <h1>🛡️ จอเฝ้าระวังเหตุฉุกเฉิน - ศูนย์ควบคุมตำรวจศาล</h1>
    <div id="status" class="status-ok">🟢 สถานะปกติ: กำลังเฝ้าระวังสัญญาณ...</div>

    <div id="alertBox" class="alert-box">
        <h1 id="alertRoom" style="font-size: 60px; margin: 0; text-shadow: 2px 2px #000;">-</h1>
        <h2 id="alertType" style="font-size: 36px; margin: 15px 0;">-</h2>
        <h3 id="alertTime" style="font-size: 28px; margin: 0;">-</h3>
        <button class="ack-btn" onclick="clearAlert()">✅ รับทราบเหตุ / กำลังเข้าควบคุมสถานการณ์</button>
    </div>

    <audio id="sirenSound" src="https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg" loop></audio>

    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io();
        const alertBox = document.getElementById('alertBox');
        const siren = document.getElementById('sirenSound');
        const statusDiv = document.getElementById('status');

        socket.on('emergency-alert', (data) => {
            document.getElementById('alertRoom').innerText = '🚨 ' + data.room;
            document.getElementById('alertType').innerText = 'เหตุการณ์: ' + data.eventType;
            document.getElementById('alertTime').innerText = 'เวลาที่เกิดเหตุ: ' + data.timestamp;
            
            statusDiv.style.display = 'none';
            alertBox.style.display = 'block';
            siren.play().catch(e => console.log('คลิกที่หน้าจอก่อนเพื่อให้เสียงดังได้'));
        });

        function clearAlert() {
            alertBox.style.display = 'none';
            statusDiv.style.display = 'block';
            statusDiv.innerText = '🟡 กำลังส่งกำลังเจ้าหน้าที่เขาระงับเหตุ...';
            siren.pause();
            siren.currentTime = 0;
        }
    </script>
</body>
</html>
    `);
});

io.on('connection', (socket) => {
    socket.on('send-alert', (data) => {
        io.emit('emergency-alert', {
            room: data.room,
            eventType: data.eventType,
            timestamp: new Date().toLocaleTimeString('th-TH')
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
});
