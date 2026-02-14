// เอาท token ที่หน้าบ้านส่งมาทำการ verify
const jwt = require('jsonwebtoken')
const prisma = require('../config/prisma')

// path ไหนมี authCheck ต้องมี token ส่งมาด้วย : หน้าบ้านต้องส่ง token มา (login)
exports.authCheck = async(req, res, next) => {
    try{
        // code 
        // เวลา frontend ส่งข้อมูลไปยัง backend จะมี header body 
        const headerToken = req.headers.authorization
        // console.log(headerToken)

        // check ว่ามีข้อมูลส่งไปไหม
        if(!headerToken){
            return res.status(401).json({
                message: 'No Token, Authorization'
            })
        }

        // ก่อน verify ต้องแยก เบอเรอ กับ ไก่กา ออกจากกันก่อน
        const token = headerToken.split(" ")[1]

        // เอา token ที่ส่งมามาถอดรหัสด้วย jwt
        // verify ข้อมูล
        const decode = jwt.verify(token, process.env.SECRET)
        req.user = decode
    
        // ค้นหา เช็ค ใน DB ว่า user มีตัวตนจริงไหม
        const user = await prisma.users.findFirst({
            where:{
                email: req.user.email
            },
            select: {
                user_id: true,
                email: true,
                username: true
            }
        })

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = {
            user_id: user.user_id.toString(),
            email: user.email,
            username: user.username,
        };


        // if(!user.enabled){
        //     return res.status(400).json({
        //         message: 'This Account Cannot Access'
        //     })

        // }

        // console.log(user)
        // console.log('Hello Middleware')

        next()
    }catch(err){
        console.log(err)
        res.status(500).json({
            message: 'Token Invalid'
        })
    }
}

exports.adminCheck = async(req, res, next) => {
    try{
        // code
        const{email} = req.user

        const adminUser = await prisma.users.findFirst({
            where:{
                email: email
            }
        })
        if(!adminUser || adminUser.role !== 'admin'){
            return res.status(403).json({
                message: 'Access Denied: Admin Only'
            })
        }

        // console.log('admin Check', adminUser)

        next()

    }catch(err){
        console.log(err)
        res.status(500).json({
            message: 'Error Admin access denied'
        })
    }
}