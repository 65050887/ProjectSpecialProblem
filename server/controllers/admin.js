exports.changOrderStatus = async(req, res) => {
    try{
        res.send('change')
    }catch(err){
        console.log(err)
        res.status(500).json({
            message: "Server error"
        })
    }
}

exports.getOrderAdmin = async(req, res) => {
    try{
        res.send('getorder')
    }catch(err){
        console.log(err)
        res.status(500).json({
            message: "Server error"
        })
    }
}