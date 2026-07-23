const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ดึงรูปตราสัญลักษณ์จาก GitHub ของคุณโดยตรง
const bgImageUrl = 'https://raw.githubusercontent.com/domdanu151-cmyk/court-alert/main/logo.jpg';

// หน้าแจ้งเหตุ (Sender)
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>แจ้งเหตุฉุกเฉิน - เจ้าพนักงานตำรวจศาล</title>
    <style>
        body { 
            font-family: Tahoma, sans-serif; 
            text-align: center; 
            padding: 20px; 
            margin: 0;
            background-color: #f1f5f9;
            background-image: linear-gradient(rgba(241, 245, 249, 0.88), rgba(241, 245, 249, 0.88)), url('${bgImageUrl}');
            background-repeat: no-repeat;
            background-position: center 130px;
            background-size: 320px auto;
            background-attachment: fixed;
        }
        .container {
            max-width: 420px;
            margin: 10px auto;
            background: rgba(255, 255, 255, 0.92);
            padding: 25px;
            border-radius: 16px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            backdrop-filter: blur(5px);
        }
        .logo { width: 110px; height: auto; margin-bottom: 10px; }
        .btn { width: 100%; padding: 20px; margin: 8px 0; font-size: 20px; font-weight: bold; border-radius: 12px; border: none; cursor: pointer; color: white; }
        .red { background-color: #dc2626; }
        .yellow { background-color: #d97706; }
        .blue { background-color: #2563eb; }
        select { padding: 14px; font-size: 18px; margin-bottom: 15px; width: 100%; border-radius: 8px; border: 2px solid #cbd5e1; }
        h2 { color: #1e293b; margin: 5px 0 15px 0; font-size: 24px; }
    </style>
</head>
<body>
    <div class="container">
        <img src="${bgImageUrl}" class="logo" alt="ตราตำรวจศาล"><br>
        <h2>🚨 แจ้งเหตุฉุกเฉิน</h2>
        <label><b>เลือกห้องพิจารณาคดี:</b></label><br><br>
        <select id="roomSelect">
            <option value="ห้องพิจารณาคดี 701">ห้องพิจารณาคดี 701</option>
            <option value="ห้องพิจารณาคดี 702">ห้องพิจารณาคดี 702</option>
            <option value="ห้องพิจารณาคดี 801">ห้องพิจารณาคดี 801</option>
        </select>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 15px 0;">
        <button class="btn red" onclick="sendAlert('🔴 ทำร้ายร่างกาย / ทะเลาะวิวาท')">🔴 ทำร้ายร่างกาย</button><br>
        <button class="btn yellow" onclick="sendAlert('🟡 จำเลยพยายามหลบหนี')">🟡 จำเลยพยายามหลบหนี</button><br>
        <button class="btn blue" onclick="sendAlert('🔵 ต้องการกำลังเสริมด่วน')">🔵 ต้องการกำลังเสริม</button>
    </div>

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
    <title>ศูนย์ควบคุม - เจ้าพนักงานตำรวจศาล</title>
    <style>
        body { 
            font-family: Tahoma, sans-serif; 
            background-color: #0f172a; 
            color: white; 
            padding: 20px; 
            text-align: center; 
            margin: 0;
            background-image: linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)), url('${bgImageUrl}');
            background-repeat: no-repeat;
            background-position: center center;
            background-size: 450px auto;
            background-attachment: fixed;
        }
        .header-box {
            background: rgba(30, 41, 59, 0.85);
            padding: 20px;
            border-radius: 16px;
            margin-bottom: 20px;
            border: 1px solid rgba(255,255,255,0.1);
            backdrop-filter: blur(8px);
            max-width: 800px;
            margin: 0 auto 20px auto;
        }
        .logo-dash { height: 110px; width: auto; margin-bottom: 10px; }
        .alert-box { 
            background-color: #dc2626; 
            padding: 40px; 
            border-radius: 20px; 
            margin: 20px auto; 
            max-width: 800px;
            display: none; 
            animation: blink 0.8s infinite; 
            border: 4px solid white; 
            box-shadow: 0 0 40px rgba(220, 38, 38, 0.8);
        }
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.35; } 100% { opacity: 1; } }
        .ack-btn { 
            padding: 20px 40px; 
            font-size: 24px; 
            background-color: #16a34a; 
            color: white; 
            border: none; 
            border-radius: 14px; 
            cursor: pointer; 
            margin-top: 25px; 
            font-weight: bold; 
        }
        .status-ok { color: #4ade80; font-size: 26px; margin-top: 30px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header-box">
        <img src="${bgImageUrl}" class="logo-dash" alt="ตราตำรวจศาล"><br>
        <h1 style="margin: 0; font-size: 30px; color: #f8fafc;">🛡️ ศูนย์ควบคุมและเฝ้าระวังเหตุฉุกเฉิน</h1>
        <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 18px;">เจ้าพนักงานตำรวจศาล</p>
    </div>

    <div id="status" class="status-ok">🟢 สถานะปกติ: กำลังเฝ้าระวังสัญญาณ...</div>

    <div id="alertBox" class="alert-box">
        <h1 id="alertRoom" style="font-size: 65px; margin: 0; text-shadow: 2px 2px #000;">-</h1>
        <h2 id="alertType" style="font-size: 36px; margin: 15px 0;">-</h2>
        <h3 id="alertTime" style="font-size: 26px; margin: 0; color: #f1f5f9;">-</h3>
        <button class="ack-btn" onclick="clearAlert()">✅ รับทราบเหตุ / กำลังส่งกำลังเขาระงับเหตุ</button>
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
            document.getElementById('alertTime').innerText = 'เวลาเกิดเหตุ: ' + data.timestamp + ' น.';
            
            statusDiv.style.display = 'none';
            alertBox.style.display = 'block';
            siren.play().catch(e => console.log('คลิกที่หน้าจอก่อนเพื่อให้เสียงดังได้'));
        });

        function clearAlert() {
            alertBox.style.display = 'none';
            statusDiv.style.display = 'block';
            statusDiv.innerText = '🟡 สถานะ: กำลังส่งกำลังเขาระงับเหตุ';
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
