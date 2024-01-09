import express from 'express';
import { authenticLoginController, getUserController, guestLoginController } from '../controllers/user.controller.js';
import { checkUserLogin, signupMiddleware } from '../middlewares/user.middleware.js';

const userRouter = express.Router();

userRouter.post('/authLogin',signupMiddleware,authenticLoginController);
userRouter.post('/guestLogin',signupMiddleware,guestLoginController);
// userRouter.post('/login',loginController);
userRouter.get('/get',checkUserLogin,getUserController)


export default userRouter;