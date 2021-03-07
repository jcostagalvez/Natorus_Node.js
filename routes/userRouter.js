const express = require('express');
const router = express.Router();
const userRouter = require('./../controllers/userControllers');
const authController = require('./../controllers/authControllers');

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/forgotpassword').post(authController.forgotPassword);
router.route('/resetpassword/:token').post(authController.resetPassword);
router.route('/updatePassword').post(authController.restrictTo, authController.updatePassword);
router.route('/updateUser').post(authController.restrictTo, authController.updateCurrentUser);

router.route('/')
    .get (userRouter.getAllusers)
    .post (userRouter.postuser); 

router.route('/:id')
    .get (userRouter.getuser)
    .patch (userRouter.updateuser)
    .delete(userRouter.deleteuser);

    module.exports = router;