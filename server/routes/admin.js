// import
const express = require('express')
const { authCheck } = require('../middlewares/authCheck')
const router = express.Router()

// import controller
const {getOrderAdmin, changOrderStatus} = require('../controllers/admin')

// path ตามด้วยฟังก์ชันที่สร้างใน controller
router.post('/admin/order-status', authCheck, changOrderStatus)
router.post('/admin/orders', authCheck, getOrderAdmin)

// router.get('/register',(req,res)=>{
//     res.send('Hello Register')
// })


module.exports = router