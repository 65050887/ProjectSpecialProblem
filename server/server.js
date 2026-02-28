// server\server.js
require("dotenv").config();

// Step 1 : import ต่างๆ ที่จำเป็นต้องใช้
const express = require('express')
// ประกาศตัวแปร app เพื่อใช้ express จะได้เรียกใช้งานได้ง่ายขึ้น
const app = express()
const morgan = require('morgan')

// readdirSync ใช้ในการอ่าน directory ไฟล์ในโฟลเดอร์
const {readdirSync} = require('fs')
const cors = require('cors')

// const authRouter = require('./routes/auth')
// const categoryRouter = require('./routes/category')

// middleware
// ใช้ dev เป็น option ในการ log ข้อมูล request ที่เข้ามา เมื่อ refresh web จะเห็น log ที่ cmd ที่แตกต่างกัน
app.use(morgan('dev'))
// app.use(express.json())
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors())

app.set("etag", false);
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

// app.use('/api', authRouter)
// app.use('/api', categoryRouter)

// console.log(readdirSync('./routes'))
// map คือการวนลูปใน array แล้วทำอะไรบางอย่างกับแต่ละตัวใน array นั้น
// readdirSync('./routes').map((c) => {
//     app.use('/api', require('./routes/'+c))
// })

readdirSync('./routes')
  .filter((f) => f.endsWith('.js'))
  .forEach((c) => {
    const route = require('./routes/' + c);
    console.log('loading route file:', c, 'typeof =', typeof route);

    if (typeof route !== 'function') {
      console.error('❌ This route file is NOT a router:', c, route);
      process.exit(1);
    }

    app.use('/api', route);
  });

// Step 3 : Router
// เมื่อมี request มาที่ localhost port 5000 /api (/ชื่ออะไรก็ได้) จะทำงานตาม res.send ที่กำหนด
// get คือการดึงข้อมูล
// app.get('/api',(req,res)=>{
//     res.send('Test DormConnect KMITL AA Pass')
// })

// post คือการส่งข้อมูล แต่ถ้าทำแบบนี้จะเยอะเกินไป เป็นหนังชีวิต เลยสร้างโฟลเดอร์แยก api แยกออกมา
// สร้างโฟลเดอร์ routes แล้วสร้างไฟล์ auth.js ขึ้นมา
// app.post('/api',(req,res)=>{
//     const{username, password} = req.body
//     // console.log(req.body) สิ่งที่อยู่ใน log จะแสดงผ่าน cmd , body คือ สิ่งที่ส่งมาจากหน้าบ้าน
//     // ตอนนี้ใช้ body จะขึ้น undefined ใน cmd เพราะยังไม่ได้ตั้งค่า middleware เพื่อให้ express รู้จัก body
//     // body คือ obj ที่มี key คือ email ข้อมูลที่ส่งมาจาก client (front-end) มายัง server (back-end)
//     console.log(username, password)
//     // console.log(req.body.email)
//     res.send('Test DormConnect KMITL AA Pass')
// })


// Step 2 : Start server
// วิธีรัน server ให้รันบน cmd : node ตามด้วยชื่อไฟล์ คือ node server
// แก้ไขโค้ดใดๆ ใน server ต้อง restart server ใหม่ทุกครั้ง
app.listen(5000,
    ()=>console.log('Server is running on port 5000'))