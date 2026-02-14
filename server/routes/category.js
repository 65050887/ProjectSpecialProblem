// import
const express = require('express')
const router = express.Router()
const {create, list, remove} = require('../controllers/category')
const {authCheck, adminCheck} = require('../middlewares/authCheck')

// @ENDPOINT  http://localhost:5000/api/category
// router.get('/category',(req,res)=>{
//     // code
//     res.send('Hello Category')
// })

router.post('/category',authCheck, adminCheck, create)
router.get('/category',authCheck, adminCheck, list)
router.delete('/category/:id', authCheck, adminCheck, remove)

module.exports = router