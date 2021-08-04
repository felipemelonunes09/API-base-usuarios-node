var express = require("express")
var app = express();
var router = express.Router();
var HomeController = require("../controllers/HomeController");
var UserController = require('../controllers/UserController')
var AdminAuth = require('../middleware/AdminAuth')

router.get('/', HomeController.index);
router.post('/auth/login', UserController.login)
router.post('/validate', AdminAuth,HomeController.validate)

router.get('/user', AdminAuth, UserController.getAll)
router.get('/user/:id', AdminAuth, UserController.getOne)
router.post('/user', UserController.create)
router.post('/user/recover', UserController.recoverPassword)
router.post('/user/password', UserController.changePassword)
router.delete('/user/:id', AdminAuth, UserController.delete)
router.patch('/user/activate/:id', AdminAuth, UserController.activate)
router.patch('/user/deactivate/:id', AdminAuth,UserController.deactivate)
router.put('/user/:id', AdminAuth,UserController.update)

module.exports = router;