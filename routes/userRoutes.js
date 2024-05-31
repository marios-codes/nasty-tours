const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// This middleware is going to run before all the following routes
// as every method in this router mini application is called in sequence
// so all the following routes are using authController.protect first before any other middleware defined in any one of them
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updateMyPassword);

router.get(
  '/me',
  userController.getMe, // use this middleware to get the current user id
  userController.getUser
);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

// Just like the protect middleware above, all routes below are restricted to 'admin' user role
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
