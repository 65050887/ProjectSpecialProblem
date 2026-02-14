const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { token } = require('morgan');

// const register ใช้ภายในไฟล์ตัวเอง
// exports.ตามด้วยชื่อฟังก์ชัน ให้ผู้อื่นเรียกใช้ได้ด้วย
// async await คือการรอคำสั่งให้ทำงานเสร็จก่อน แล้วค่อยทำคำสั่งถัดไป
exports.register = async(req,res) => {
    // code ทุกอย่างจะยู๋ใน try...catch เผื่อ error
    try{
        // code
        const {username, email, password} = req.body
        
        // Step1 validate body
        if (!username) { 
            return res.status(400).json({ 
                message: "Username is required" 
            });
        }

        // check email
        if(!email){
            return res.status(400).json({
                message: "Email is required"
            })
        }
        // check password
        if(!password){
            return res.status(400).json({
                message: "Password is required"
            })
        }

        // Step2 check email in DB already exists ?
        const user = await prisma.users.findFirst({
            where: {
                email: email
            }
        })

        if(user){
            return res.status(400).json({
                message: "Email already exists"
            })
        }

        // Step3 hash password
        const hashPassword = await bcrypt.hash(password, 10)
        
        // console.log(user)
        // console.log(hashPassword)

        //Step4 Register user to DB
        await prisma.users.create({
            data: {
                username: username,
                email: email,
                password_hash: hashPassword
            }
        })
        
        res.send('Register Success')
    }catch(err){
        console.log(err)
        res.status(500).json({
            message: "Server Error"
        })
    }
}

exports.login = async(req,res) => {
    try{
        const {email, password} = req.body

        // step 1 check email in DB
        const user = await prisma.users.findFirst({
            where: {
                email: email
            }
        })

        if(!user){
            return res.status(400).json({
                message: "Email not found"
            })
        }

        // step 2 check password
        const isMatch =  await bcrypt.compare(password, user.password_hash)
        if(!isMatch){
            return res.status(400).json({
                message: "Password Ivalid!!"
            })
        }
        
        // step 3 create payload & token คือ obj ที่เราสร้างขึ้นมาเพื่อเก็บข้อมูลของ user
        const payload = {
            id: user.user_id.toString(),
            email: user.email,
            username: user.username
            // role: user.role
        }

        // step 4 generate token & send to user
        jwt.sign(payload, process.env.SECRET, {expiresIn: '7d'}, (err, token) => {
            if(err){
                return res.status(500).json({
                    message: "Server Error"
                })
            }
            res.json({payload, token})
        } )

    }catch(err){
        console.log("LOGIN ERROR:", err); 
        // console.log(err)
        res.status(500).json({
            message: "Server Error"
        })
    }
}

exports.currentUser = async(req,res) => {
    try{
        const user = await prisma.users.findFirst({
            where:{
                email: req.user.email},
                select: {
                    id: true, 
                    email: true,
                    name: true,
                    role: true,
                }
            }
        )
        res.json({user})
    }catch{
        console.log(err)
        res.status(500).json({
            message: "Server Error"
        })
    }
}


