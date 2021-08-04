const knex = require('../database/connection')
const bcrypt = require('bcrypt')
const PasswordToken = require('./PasswordToken')

const jwt = require ('jsonwebtoken')

// Equivalente há um service == lida com os dados
class User {

    constructor(){
        this.data_info = {
            table_name: 'users',
            select: ['idusers', 'name', 'email', 'role', 'logout', 'activate']
        }
    }

    async create(userObject) {

        let is_ok = await this.findByEmail(userObject.email)
        if (is_ok.length > 0)  
            return { status: false, msg: 'E-mail já cadastrado no sistema'}

        userObject.password = await this.hash_password(userObject.password)
        return knex.insert(userObject).table(this.data_info.table_name).catch((e) => {
            return undefined
        })
    }

    async findAll(){
        try {
            let data = await knex.select(this.data_info.select).table(this.data_info.table_name)
            let url_array = []

            data.forEach(user => {
                url_array.push({ 
                    name: user.name,
                    url: `${process.env.URL_BASE}user/${user.idusers}` 
                })
            })
            return data
        }
        catch(e) {
            console.log(e)
            return undefined
        }
    }

    async findOne(id){
        try {
            var result = await knex.select(this.data_info.select).where({idusers: id}).table(this.data_info.table_name)
            if(result[0].activate == false){
                return undefined;
            }
            return result[0]

        }catch(err) {
            return undefined
        }
    }

    async update(id, userObject) {

        let { email, name, role, logout } = userObject
        let is_ok = await this.findByEmail(email)
        let user = await this.findOne(id)
        let edit_user = {}

        if (user == undefined)
            return { status: false, msg: 'Account not found' }

        if (is_ok.length > 0){
            return { status: false, msg: 'this email is already in use'}
        }

        if (email != undefined)
            edit_user.email = email;

        if (name != undefined) 
            edit_user.name = name
        
        if (role != undefined) 
            edit_user.role = role

        if (logout != undefined)
            edit_user.logout = logout

        await knex.update(edit_user).where({ idusers: id}).table(this.data_info.table_name).catch(erro => {
            return { status: false, msg: 'Internal crash'}
        })

        return { status: true, msg: 'Ok' }

    }

    async findByEmail(email) {

        return knex.select(this.data_info.select).from(this.data_info.table_name).where({ email: email}).catch((e) => {
            return { status: false, msg: 'Internal crash'}
        })

    }

    async delete (id) {
       
        try {

            let user = await this.findOne(id)
            if (user) {
                return knex.delete().where({ idusers: id }).table(this.data_info.table_name)
            }
            else {
                return { status: false, msg: 'User not found'}
            }
        } 
        catch(e) {
            return { status: false, msg: 'Internal Crash' }
        } 

    }

    async isActivate (id, activation) {

        try {
            return knex.update({ activate: activation}).where({ idusers: id}).table(this.data_info.table_name)
        }
        catch (e) {
            return { status: false, msg: 'Internal Crash' }
        }
    }

    async changePassword(password, token) {

        try{
            let hash = await this.hash_password(password)
            await PasswordToken.deactivate(token)
            await knex.update({ password: hash }).where({ idusers: token.user_id }).table(this.data_info.table_name)
        }catch (e){
            console.log(e)
            return { status: false, msg: 'Internal Crash'}
        }
    
    }

    async auth(email, password) {

        try {
            
            let user = (await knex.select().where({ email: email }).table(this.data_info.table_name))[0]

            if (user) {

                let result = await bcrypt.compare(password, user.password)

                if (result) {
                    let jwt_token = jwt.sign({ user: email, id: user.idusers }, process.env.JW_SECRET);
                    return { status: true, token: jwt_token}
                }
                else {
                    return { status: false, msg: 'Incorrect credentials'}
                }
            }
            else {
                return { status: false, msg: 'User not found'}
            }
        }
        catch(e) {
            console.log(e)
            return { status: false, msg: 'Internal Crash' }
        }
        
    }

  
    async hash_password (password) {
        
        try {
            const salt = 10
            let hash = await bcrypt.hash( password, salt)

            return hash
        }
        catch(e){
            console.log(e)
            return { status: false, msg: 'Internal Crash'}
        }
    }
}

module.exports = new User();