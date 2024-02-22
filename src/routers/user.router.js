import express from 'express';
import { authenticLoginController, decreaseCoinsController, decreaseVehiclePowerController, getUnlockLevels, getUserController, guestLoginController, referAndEarnController, updateCoinController, updateVehiclePowerController } from '../controllers/user.controller.js';
import { checkUserLogin } from '../middlewares/user.middleware.js';

const userRouter = express.Router();

userRouter.post('/authLogin',authenticLoginController);
userRouter.post('/guestLogin',guestLoginController);
userRouter.get('/get',checkUserLogin , getUserController);
userRouter.post('/refer',checkUserLogin,referAndEarnController);
userRouter.post('/updateCoins',checkUserLogin,updateCoinController);
userRouter.post('/decreaseCoins',checkUserLogin,decreaseCoinsController);
userRouter.post('/updateVehiclePower',checkUserLogin,updateVehiclePowerController);
userRouter.post('/decreaseVehiclePower',checkUserLogin,decreaseVehiclePowerController);
userRouter.get("/unlockLevelCount",checkUserLogin,getUnlockLevels);
export default userRouter;