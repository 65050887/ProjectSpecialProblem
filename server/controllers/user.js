// server\controllers\user.js
const prisma = require("../config/prisma")
const { create } = require("./product")

exports.listUsers = async(req, res) => {
    try{
        // code
        const users = await prisma.user.findMany({
            select:{
                id: true,
                email: true,
                role: true,
                enabled: true
            }
        })
        console.log(require.user)
        res.json(users)
    }catch(err){
        console.log(err)
        res.status(500).json({
            message: 'Server Error'
        })
    }
}

exports.changeStatus = async(req, res) => {
    try{
        // code
        const{id, enabled} = req.body
        console.log(id, enabled)

        const user = await prisma.user.update({
            where:{
                id: Number(id)
            },
            data:{
                    enabled: enabled
            }
        })
        res.send('Update Status Success')
    }catch(err){
        console.log(err)
        res.status(500).json({
            message: 'Server Error'
        })
    }
} 

exports.changeRole = async(req, res) => {
    try{
        // code
        const{id, role} = req.body

        const user = await prisma.user.update({
            where:{
                id: Number(id)
            },
            data:{
                    role: role
            }
        })
        res.send('Update Role Success')
    }catch(err){
        console.log(err)
        res.status(500).json({
            message: 'Server Error'
        })
    }
}

exports.userCart = async(req, res) => {
    try{
        // code
        const {cart} = req.body
        console.log(cart)
        console.log(req.user.id)

        const user = await prisma.user.findFirst({
            where: {
                id: Number(req.user.id)
            }
        })
        // console.log(user)

        // delete old cart item เพื่อเพิ่มสินค้าใหม่เข้าไป
        await prisma.productOnCart.deleteMany({
            where:{
                cart:{
                    orderedById:user.id
                }
            }
        })

        // delete old cart 
        await prisma.cart.deleteMany({
            where:{
                orderedById: user.id
            }
        })

        // prepare product
        let products = cart.map((item) => ({
            productId: item.id,
            count: item.count,
            price: item.price
        }))

        // หาผลรวม
        let cartTotal = products.reduce((sum, item) => sum + item.price * item.count, 0)

        // new cart
        const newCart = await prisma.cart.create({
            data:{
                products:{
                    create: products
                },
                cartToltal: cartTotal,
                orderedById: user.id
            }
        })
        console.log(newCart)
        res.send('Add Cart OK')
    }catch(err){
        console.log(err)
        res.status(500).json({
            message: 'Server Error'
        })
    }
}

// ดึงข้อมูลในตะกร้าสินค้าออกมา
exports.getUserCart = async(req, res) => {
    try{
        // code
        const cart = await prisma.cart.findFirst({
            where:{
                orderedById: Number(req.user.id)
            },
            include:{
                products:{
                    include:{
                        product:true
                    }
                }
            }
        })
        console.log(cart)
        res.send({
            products: cart.products,
            cartToltal: cart.cartToltal
        })
    }catch(err){
        console.log(err)
        res.status(500).json({
            message: 'Server Error'
        })
    }
}

exports.emptyCart = async(req, res) => {
    try{
        // code
        const cart = await prisma.cart.findFirst({
            where:{
                orderedById: Number(req.user.id)
            }
        })
        if(!cart){
            return res.status(400).json({
                message: 'No Cart'
            })
        }

        await prisma.productOnCart.deleteMany({
            where:{
                cartId: cart.id
            }
        })

        const result = await prisma.cart.deleteMany({
            where:{
                orderedById: Number(req.user.id)
            }
        })

        console.log(result)
        res.send({
            message: 'Cart Empty Success',
            deletedCount: result.count
        })
    }catch(err){
        console.log(err)
        res.status(500).json({
            message: 'Server Error'
        })
    }
}

// เคลียร์ข้อมูลในตะกร้าสินค้า
exports.saveAddress = async(req, res) => {
    try{
        // code
        const{address} = req.body
        console.log(address)
        const addressUser = await prisma.user.update({
            where:{
                id: Number(req.user.id)
            },
            data:{
                address: address
            }
        })

        console.log(req.user)
        res.json({ok:true, message: 'Address update success'})
    }catch(err){
        console.log(err)
        res.status(500).json({
            message: 'Server Error'
        })
    }
} 

exports.saveOrder = async(req, res) => {
    try{
        // code
        // step 1 Get user cart
        const userCart = await prisma.cart.findFirst({
            where:{
                orderedById: Number(req.user.id)
            },
            include:{
                products: true
            }
        })

        // Check Empty 
        if(!userCart || userCart.products.length === 0){
            return res.status(400).json({
                ok: false, 
                message: 'Cart is Empty'
            })
        }

        // check quantity
        for(const item of userCart.products){
            // console.log(item)
            const product = await prisma.product.findUnique({
                where:{
                    id: item.productId
                },
                select:{
                    quantity: true, 
                    title: true
                }
            })
            // console.log(item)
            // console.log(product)

            if(!product || item.count > product.quantity){
                return res.status(400).json({
                    ok: false,
                    message: `ขออภัยไม่มีข้อมูลของ ${product?.title || `product`} ค่ะ`
                })
            }
        }

        // create new order
        const order = await prisma.order.create({
            data:{
                Products:{
                    create: userCart.products.map((item)=>({
                        productId: item.productId,
                        count: item.count,
                        price: item.price
                    }))
                },
                orderedBy:{
                    connect:{
                        id: req.user.id
                    }
                },
                cartToltal: userCart.cartToltal
            }
        })

        // update product
        const update = userCart.products.map((item) => ({
            where:{
                id: item.productId
            },
            data:{
                quantity:{
                    decrement: item.count
                },
                sold:{
                    increment: item.count
                }
            }
        }))

        console.log(update)

        await Promise.all(
            update.map((updated) => prisma.product.update(updated))
        )

        await prisma.cart.deleteMany({
            where:{
                orderedById: Number(req.user.id)
            }
        })

        res.json({
            ok: true,
            order
        })
    }catch(err){
        console.log(err)
        res.status(500).json({
            message: 'Server Error'
        })
    }
} 

exports.getOrder = async(req, res) => {
    try{
        // code
        const orders = await prisma.order.findMany({
            where:{
                orderedById: Number(req.user.id)
            },
            include:{
                Products:{
                    include:{
                        product: true
                    }
                }
            }
        })

        if(orders.length === 0){
            return res.status(400).json({
                ok: false,
                message: 'No orders'
            })
        }

        res.json({
            ok: true,
            orders
        })
    }catch(err){
        console.log(err)
        res.status(500).json({
            message: 'Server Error'
        })
    }
} 

// POST /api/user/profile-picture
exports.updateProfilePicture = async (req, res) => {
  try {
    const { pictureUrl } = req.body;

    if (!pictureUrl) {
      return res.status(400).json({ ok: false, message: "Picture URL is required" });
    }

    const userId = BigInt(req.user.user_id);

    const updatedUser = await prisma.users.update({
      where: { user_id: userId },
      data: { picture: pictureUrl },
      select: { user_id: true, picture: true },
    });

    return res.json({
      ok: true,
      message: "Profile picture updated successfully",
      picture: updatedUser.picture,
    });
  } catch (err) {
    console.log("updateProfilePicture error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};



// Update user profile (name, email, phone, etc.)
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.username = name; // ใน schema มี username
    if (email !== undefined) updateData.email = email;
    // ใน schema ของเธอ "ยังไม่มี phone" → ถ้าอยากเก็บจริง ต้องเพิ่ม field ใน schema + migrate
    // ถ้ายังไม่เพิ่ม ให้คอมเมนต์ไว้ก่อนเพื่อไม่ให้ Prisma error
    // if (phone !== undefined) updateData.phone = phone;

    const userId = BigInt(req.user.user_id);

    const updatedUser = await prisma.users.update({
      where: { user_id: userId },
      data: updateData,
      select: { user_id: true, username: true, email: true, picture: true },
    });

    return res.json({
      ok: true,
      message: "Profile updated successfully",
      user: {
        user_id: updatedUser.user_id.toString(),
        username: updatedUser.username,
        email: updatedUser.email,
        picture: updatedUser.picture,
      },
    });
  } catch (err) {
    console.log("updateProfile error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};