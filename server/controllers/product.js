const prisma =  require('../config/prisma');

exports.create = async(req,res) => {
    try{
        // code
        const {title, description, price, quantity, categoryId, images} = req.body;
        // console.log(title, description, price, quantity, images);

        const product = await prisma.product.create({
            data: {
                title: title,
                description: description,
                price: parseFloat(price), // แปลงเป็น number
                quantity: parseInt(quantity), // แปลงเป็น number
                categoryId: parseInt(categoryId),
                // 1 product มีได้หลาย image
                // images: images // มาจาก req.body
                images: {
                    create: images.map((item) => ({
                        asset_id: item.asset_id,
                        public_id:item.public_id,
                        url: item.url,
                        secure_url: item.secure_url
                    }))
                }
            }
        })
        res.send(product)
    }catch(err){
        console.log(err)
        res.status(500).json({
            message: 'Server Error'
        })
    }
}

exports.list = async(req,res) => {
    try{
        // code
        const {count} = req.params

        const products = await prisma.product.findMany({
            take: parseInt(count),
            orderBy: {createdAt: "desc"},
            // รวมข้อมูล category กับ images คล้ายๆ การ join table
            include: {
                category: true,
                images: true
            }
        })

        // console.log(typeof count)
        res.send(products)
    }catch(err){
        console.log(err)
        res.status(500).json({
            message: 'Server Error'
        })
    }
}

exports.read = async(req,res) => {
    try{
        // code
        const {id} = req.params
        const products = await prisma.product.findFirst({
            where: {
                id: Number(id)
            },
            // รวมข้อมูล category กับ images คล้ายๆ การ join table
            include: {
                category: true,
                images: true
            }
        })

        // console.log(typeof count)
        res.send(products)
    }catch(err){
        console.log(err)
        res.status(500).json({
            message: 'Server Error'
        })
    }
}

exports.update = async(req,res) => {
    try{
        // code
        const {title, description, price, quantity, categoryId, images} = req.body;
        // console.log(title, description, price, quantity, images);

        // clear images for update
        await prisma.image.deleteMany({
            where: {
                productId: Number(req.params.id)
            }
        })

        const product = await prisma.product.update({
            where: {
                id: Number(req.params.id)
            },
            data: {
                title: title,
                description: description,
                price: parseFloat(price), // แปลงเป็น number
                quantity: parseInt(quantity), // แปลงเป็น number
                categoryId: parseInt(categoryId),
                // 1 product มีได้หลาย image
                // images: images // มาจาก req.body
                images: {
                    create: images.map((item) => ({
                        asset_id: item.asset_id,
                        public_id:item.public_id,
                        url: item.url,
                        secure_url: item.secure_url
                    }))
                }
            }
        })
        res.send(product)
    }catch(err){
        console.log(err)
        res.status(500).json({
            message: 'Server Error'
        })
    }
}

exports.remove = async(req,res) => {
    try{
        // code
        const {id} = req.params

        // หนังชีวิต 


        await prisma.product.delete({
            where: {
                id: Number(id)
            }
        })
        res.send('Delete Success')
    }catch(err){
        console.log(err)
        res.status(500).json({
            message: 'Server Error'
        })
    }
}

exports.listby = async(req,res) => {
    try{
        // code
        const {sort, order, limit} = req.body
        console.log(sort, order, limit)

        const products = await prisma.product.findMany({
            take: parseInt(limit),
            orderBy: {[sort]: order},
            // รวมข้อมูล category กับ images คล้ายๆ การ join table
            include: {
                category: true
            }
        })

        res.send(products)
    }catch(err){
        console.log(err)
        res.status(500).json({
            message: 'Server Error'
        })
    }
}

const handleQuery = async(req, res, query) => {
    try{
        // code
        const products = await prisma.product.findMany({
            where: {
                title: {
                    contains: query,
                }
            },
            include: {
                category: true,
                images: true
            }
        })
        res.send(products)
    }catch(err){
        // error
        console.log(err)
        res.status(500).send('Server Error')
    }
}

const handlePrice = async(req, res, priceRange) => {
    try{
        // code
        const products = await prisma.product.findMany({
            where:{
                price:{
                    gte: priceRange[0],
                    lte: priceRange[1]
                }
            },
            include:{
                category: true,
                images: true
            }
        })
        res.send(products)
    }catch(err){
        console.log(err)
        res.send(500).json({
            message: ('Serever Error')
        })
    }
}

const handleCategory = async(req, res, categoryId) => {
    try{
        // code
        const products = await prisma.product.findMany({
            where:{
                categoryId: {
                    in: categoryId.map((id) => Number(id))
                }
            },
            include: {
                category: true,
                images: true
            }
        })
    }catch(err){
        console.log(err)
        res.send(500).json({
            message: ('Server Error')
        })

    }
}

exports.searchFilters = async(req,res) => {
    try{
        // code
        const {query, category, price} = req.body

        if(query){
            console.log('query-->', query)
            await handleQuery(req, res, query)
        }
        if(category){
            console.log('category-->', category)
            await handleCategory(req, res, category)
            
        }
        if(price){
            console.log('price-->', price)
            await handlePrice(req, res, price)
        }

        // res.send('Hello Search Filters product')
    }catch(err){
        console.log(err)
        res.status(500).json({
            message: 'Server Error'
        })
    }
}


