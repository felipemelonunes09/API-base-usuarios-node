const User = require('../models/User')
const PasswordToken = require('../models/PasswordToken')
const jwt = require ('jsonwebtoken')


class UserController {

    async create(req, res) {

        let { email, name, password } = req.body

        if (email == undefined || email == '' || email == ' ') {
            res.status(400)
            res.json({ msg: 'Invalid email' })
            return;
        }

        if (name == undefined || name == '' || name == ' ') {
            res.status(400);
            res.json({ msg: 'Invalid name'})
            return;
        }

        if (password == undefined) {
            res.status(400)
            res.json({ msg: 'Invalid password'})
            return;
        }

        if (password.length < 6){
            res.status(400)
            res.json({ msg: 'password too short'})
            return;
        }

        let result = await User.create({ email, name, password })

        if (result.status == false) 
            res.status(400)
        
        res.send(result)
    } 

    // should implement query params
    async getAll(req, res) {
        let result = await User.findAll();
        res.json(result)
    }

    async getOne(req, res) {

        let id = req.params.id;
        let result = await User.findOne(id)

        if (result == undefined) {
            res.status(404)
            res.json({ err: 'Account not found or deactivated'})
        }

        res.json(result)
    }

    async update(req, res) {

        let id = req.params.id;
        let data = req.body;

        let result = await User.update(id, data)
        if (!result.status){
            res.status(500)
        }

        res.json(result)
    }

    async delete(req, res) {

        var id = req.params.id;
        let result = await User.delete(id)

        if (result.status){
            res.status(200)
        }
        else {
            res.status(406)
        }

        res.json(result)
    }
    
    async activate(req, res) {
        let id = req.params.id
        let result = await User.isActivate(id, true)
        
        res.json(result)
    }

    async deactivate(req, res) {
        let id = req.params.id
        let result = await User.isActivate(id, false)

        res.json(result)
    }

    async recoverPassword(req, res) {

        let email = req.body.email
        let result = await PasswordToken.create(email)

        if (result.status) {
            res.status(200)
        }
        else {
            res.status(406)
        }

        // warning this should send an email to the user
        res.json(result)
    }

    async changePassword(req, res) {

        let { token, password } = req.body;

        let validation = await PasswordToken.validate(token)
        if (validation.status){
            let result = await User.changePassword( password, validation.token )
            res.json(result)
        }
        else {
            res.status(406)
            res.send('Token inválido')
        }
    } 

    async login (req, res) {

        let { email, password } = req.body;
        let result = await User.auth(email, password)

        if (result.status == false) 
            res.status(404)

        res.json(result)

    }

}

module.exports = new UserController();