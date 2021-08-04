const jwt = require('jsonwebtoken')
const User = require('../models/User')


module.exports = async function(req, res, next) {
    
    const authToken = req.headers['authorization']
    if (authToken != undefined) {

        try {
            const bearer = authToken.split(' ')
            let token = bearer[1]

            let decoded = jwt.verify(token, process.env.JW_SECRET)
            var user = (await User.findByEmail(decoded.user))[0]
            
            if (user.logout) {
                res.status(500)
                res.json({ status: false, msg: 'Forced logout'})

                await User.update( decoded.id, { logout: 0 } )
                return;
            }
            else {
                switch(user.role){
                    case 0: res.status(500); res.json({ status: false, msg: 'Permission bellow necessary'})
                    case 1: next(); break;
                }
            }
        }catch(e) {

            console.log(e)
            res.status(500)
            res.json({ status: false, msg: 'Invalid Token'})
        }
    }
    else {
        res.status(403)
        res.json({ status: false, msg: 'You must login to access this route'})
        return;
    }
}