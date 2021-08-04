const knex = require('../database/connection')
var User = require('./User')

class PasswordToken {

    constructor(){
        this.data_info = {
            table_name: 'password_tokens',
            select: ['idusers', 'name', 'email', 'role', 'logout', 'activate']
        }
    }

    async create(email) {

        try {

            let user = await User.findByEmail(email)
            console.log(user)
            if (user[0].activate == 1) {

                let token = Date.now() * Math.random();
                let data = {
                    user_id: user[0].idusers,
                    token: token
                }

                console.log(data)
                await knex.insert(data).table(this.data_info.table_name)
                return { status: true, token}
            }
            else {
                return { status: false, msg: 'User not found'}
            }
        }
        catch(e) {
            console.log(e)
            return { status: false, msg: 'Internal Crash'}
        }
    }

    async validate(token) {

        let validation = { status: false, token: undefined};
        try {

            let result = await knex.select().where({token}).table(this.data_info.table_name);
            if (result.length > 0) {
                
                var tk = result[0];
                if (tk.activate) {
                    validation.status = tk.activate
                    validation.token = tk
                } 
            }
        }
        catch(e) {
            console.log(e)
            return validation
        }

        return validation
    }

    async deactivate(token) {
        try {
            await knex.update({ activate: 0 }).where({token: token.token }).table(this.data_info.table_name)
        }catch(e) {
            return { status: false, msg: 'Internal Crash'}
        }
        
    }
}

module.exports = new PasswordToken();