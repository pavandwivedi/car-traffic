import express from 'express';
import { authenticLoginController, getUserController, guestLoginController } from '../controllers/user.controller.js';
import { checkUserLogin } from '../middlewares/user.middleware.js';

const userRouter = express.Router();

userRouter.post('/authLogin',authenticLoginController);
userRouter.post('/guestLogin',guestLoginController);
userRouter.get('/get',checkUserLogin , getUserController);

export default userRouter;