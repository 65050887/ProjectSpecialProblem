// server\routes\user.js
const express = require('express')
const router = express.Router()
const {authCheck, adminCheck} = require('../middlewares/authCheck')
const {
    listUsers,
    changeStatus, 
    changeRole,
    userCart,
    getUserCart,
    emptyCart,
    saveAddress,
    saveOrder,
    getOrder,
    updateProfilePicture,
    updateProfile

} = require('../controllers/user')

// middlewares คือ ตรงกลาง เมื่อมี req มาที่ path users เขาก็จะทำฟังก์ชัน listUsers
router.get('/users',authCheck, adminCheck, listUsers)
router.post('/change-status',authCheck, adminCheck,changeStatus);
router.post('/change-role', authCheck, adminCheck,changeRole)

router.post('/user/cart',authCheck, userCart)
router.get('/user/cart', authCheck,getUserCart)
router.delete('/user/cart',authCheck, emptyCart)

router.post('/user/address', authCheck,saveAddress)

router.post('/user/order', authCheck,saveOrder)
router.get('/user/order', authCheck,getOrder)

// Profile picture and profile update routes
router.post('/user/profile-picture', authCheck, updateProfilePicture)
router.post('/user/profile', authCheck, updateProfile)

module.exports = router