
class HomeController{

    async index(req, res){
        res.send("API ONLINE");
        return
    }

    async validate(req, res) {
        res.send('okay')
    }

}

module.exports = new HomeController();