const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// URL ของตราสัญลักษณ์ที่นำมาใช้เป็นพื้นหลัง (จางๆ)
const bgImageUrl = 'https://raw.githubusercontent.com/domdanu151-cmyk/court-alert/main/image_23febd.png';

// หน้าแจ้งเหตุ (Sender) - ปรับปรุงเพิ่มภาพพื้นหลัง
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
            background-color: #f0f2f5; 
            margin: 0;
            /* เพิ่มภาพพื้นหลังแบบจางๆ */
            background-image: linear-gradient(rgba(240, 242, 245, 0.9), rgba(240, 242, 245, 0.9)), url('${bgImageUrl}');
            background-repeat: no-repeat;
            background-position: center center;
            background-attachment: fixed;
            background-size: contain; /* หรือ cover ตามความชอบ */
        }
        .container {
            max-width: 450px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.9);
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .btn { width: 100%; max-width: 400px; padding: 25px; margin: 10px 0; font-size: 22px; font-weight: bold; border-radius: 12px; border: none; cursor: pointer; color: white; transition: background 0.3s; }
        .btn:hover { opacity: 0.9; }
        .red { background-color: #dc2626; }
        .yellow { background-color: #f59e0b; }
        .blue { background-color: #2563eb; }
        select { padding: 15px; font-size: 20px; margin-bottom: 20px; width: 100%; max-width: 400px; border-radius: 8px; border: 2px solid #ddd; }
        h2 { color: #1e3a8a; margin-top: 0; }
    </style>
</head>
<body>
    <div class="container">
        <h2>🚨 แจ้งเหตุฉุกเฉินด่วน</h2>
        <p style="color: #666; margin-top: -10px;">(สำหรับเจ้าพนักงานตำรวจศาล)</p>
        <label><b>เลือกห้องพิจารณาคดี:</b></label><br>
        <select id="roomSelect">
            <option value="ห้องพิจารณาคดี 701">ห้องพิจารณาคดี 701</option>
            <option value="ห้องพิจารณาคดี 702">ห้องพิจารณาคดี 702</option>
            <option value="ห้องพิจารณาคดี 801">ห้องพิจารณาคดี 801</option>
        </select>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <button class="btn red" onclick="sendAlert('🔴 ทำร้ายร่างกาย / ทะเลาะวิวาท')">🔴 ทำร้ายร่างกาย</button><br>
        <button class="btn yellow" onclick="sendAlert('🟡 จำเลยพยายามหลบหนี')">🟡 จำเลยพยายามหลบหนี</button><br>
        <button class="btn blue" onclick="sendAlert('🔵 ต้องการกำลังเสริม')">🔵 ต้องการกำลังเสริม</button>
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

// หน้าจอศูนย์ควบคุม (Dashboard) - ปรับปรุงเพิ่มภาพพื้นหลัง
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
            /* เพิ่มภาพพื้นหลังแบบจางๆ บนพื้นหลังเข้ม */
            background-image: linear-gradient(rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.95)), url('${bgImageUrl}');
            background-repeat: no-repeat;
            background-position: center center;
            background-attachment: fixed;
            background-size: contain;
        }
        .header-box {
            background: rgba(255,255,255,0.05);
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 30px;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .alert-box { 
            background-color: #dc2626; 
            padding: 50px; 
            border-radius: 20px; 
            margin-top: 30px; 
            display: none; 
            animation: blink 0.8s infinite; 
            border: 5px solid white; 
            box-shadow: 0 0 30px rgba(220, 38, 38, 0.7);
        }
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
        .ack-btn { 
            padding: 25px 50px; 
            font-size: 26px; 
            background-color: #16a34a; 
            color: white; 
            border: none; 
            border-radius: 15px; 
            cursor: pointer; 
            margin-top: 30px; 
            font-weight: bold; 
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            transition: transform 0.2s;
        }
        .ack-btn:active { transform: scale(0.98); }
        .status-ok { color: #4ade80; font-size: 26px; margin-top: 40px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header-box">
        <img src="${bgImageUrl}" alt="Logo" style="height: 80px; margin-bottom: 10px;">
        <h1 style="margin: 0; font-size: 32px;">🛡️ ศูนย์ควบคุมและเฝ้าระวังเหตุฉุกเฉิน</h1>
        <p style="color: #aaa; margin: 5px 0 0 0;">(เจ้าพนักงานตำรวจศาล)</p>
    </div>

    <div id="status" class="status-ok">🟢 สถานะปกติ: กำลังเฝ้าระวังสัญญาณ...</div>

    <div id="alertBox" class="alert-box">
        <h1 id="alertRoom" style="font-size: 70px; margin: 0; text-shadow: 3px 3px #000;">-</h1>
        <h2 id="alertType" style="font-size: 40px; margin: 20px 0;">-</h2>
        <h3 id="alertTime" style="font-size: 30px; margin: 0; color: #eee;">-</h3>
        <button class="ack-btn" onclick="clearAlert()">✅ รับทราบเหตุ / กำลังส่งกำลังเขาระงับเหตุ</button>
    </div>

    <!-- เสียงไซเรนเตือน -->
    <audio id="sirenSound" src="https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg" loop></audio>

    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io();
        const alertBox = document.getElementById('alertBox');
        const siren = document.getElementById('sirenSound');
        const statusDiv = document.getElementById('status');

        socket.on('emergency-alert', (data) => {
            // อัปเดตข้อมูลเหตุการณ์
            document.getElementById('alertRoom').innerText = '🚨 ' + data.room;
            document.getElementById('alertType').innerText = 'เหตุการณ์: ' + data.eventType;
            document.getElementById('alertTime').innerText = 'เวลาเกิดเหตุ: ' + data.timestamp + ' น.';
            
            // แสดงหน้าจอแจ้งเตือนและเปิดเสียง
            statusDiv.style.display = 'none';
            alertBox.style.display = 'block';
            
            // พยายามเปิดเสียง (ต้องมีการคลิกหน้าจอมาก่อน 1 ครั้ง)
            siren.play().catch(e => console.log('คลิกที่หน้าจอก่อนเพื่อให้เสียงดังได้'));
            
            // ทำให้มือถือสั่น (ถ้าเบราว์เซอร์รองรับ)
            if ("vibrate" in navigator) {
                navigator.vibrate([500, 300, 500, 300, 500]);
            }
        });

        function clearAlert() {
            // ซ่อนหน้าจอแจ้งเตือนและปิดเสียง
            alertBox.style.display = 'none';
            statusDiv.style.display = 'block';
            statusDiv.innerText = '🟡 สถานะ: กำลังส่งกำลังเจ้าหน้าที่เขาระงับเหตุที่ ' + document.getElementById('alertRoom').innerText.replace('🚨 ', '');
            
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
