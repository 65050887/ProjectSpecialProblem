const express = require('express')
const router = express.Router()

// import controller
const {create, list, read, update, remove, listby, searchFilters} = require('../controllers/product')

// @ENDPOINT  http://localhost:5000/api/product
// post คือ สร้างสินค้า 
router.post('/product', create)
// get คือ ดึงข้อมูลสินค้า
router.get('/products/:count', list)
// read คือ อ่านข้อมูลสินค้าชนิดเดียว
router.get('/product/:id', read)
// update คือ แก้ไขสินค้า
router.put('/product/:id', update)
// delete คือ ลบสินค้า
router.delete('/product/:id', remove)
// post by category id คือ สร้างสินค้าตามหมวดหมู่
router.post('/productby', listby)
// search and filter สินค้า
router.post('/search/filters', searchFilters)


module.exports = router 