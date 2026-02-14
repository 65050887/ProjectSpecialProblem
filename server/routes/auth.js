// import
const express = require('express')
const router = express.Router()

// import controller
const {register, login, currentUser} = require('../controllers/auth')
// import middleware
const {authCheck, adminCheck} = require('../middlewares/authCheck')

// path ตามด้วยฟังก์ชันที่สร้างใน controller
router.post('/register', register)
router.post('/login', login)
router.post('/current-user', authCheck, currentUser)
router.post('/current-admin',authCheck, adminCheck, currentUser)

// router.get('/register',(req,res)=>{
//     res.send('Hello Register')
// })


module.exports = router