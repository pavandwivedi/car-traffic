import { guestModel } from "../models/user.model.js";
import { authModel } from "../models/user.model.js";
import { facebookModel } from "../models/user.model.js";
import {userModel} from "../models/user.model.js";
import { generateAccessToken } from "../services/generateAccessToken.service.js";
import { error, success } from "../utills/responseWrapper.utill.js";
import {generateUniqueReferralCode} from "../services/generateReferalCode.js"

export async function guestLoginController(req, res) {
    try {
        const { deviceID } = req.body;
        console.log(deviceID);
       
        if (!deviceID) {
            return res.send(error(422, "insufficient data"));
        }
       
        const  existingUser = await guestModel.findOne({ deviceID });
       
        if (!existingUser) {
           
            const referralCode = generateUniqueReferralCode();
          
            const newUser = await guestModel.create({deviceID,referralCode});
            console.log(newUser);
            const accessToken = generateAccessToken({ ...newUser })
            return res.send(success(200,{accessToken, isNewUser: true}))
        }
  
        const accessToken = generateAccessToken({ ...existingUser });
        return res.send(success(200, {accessToken, isNewUser: false}));
    } catch (err) {
      
        return res.send(error(500, err.message));
    }
  }
  export async function authenticLoginController(req, res) {
    try {
        const { email, deviceID ,name} = req.body;
        if (!email || !deviceID || !name) {
            return res.send(error(422, "insufficient data"));
        }
    
        // Find existing user with the same email
        const guestUser = await guestModel.findOne({ deviceID });
        
        const existingUser = await authModel.findOne({ email });
        
        if (!existingUser) {
            
            // Generate referral code only for new users
            const referralCode = generateUniqueReferralCode();
            const newUser = new authModel({ email,name, referralCode });

            // Transfer guest user data to authenticated user
            if (guestUser) {
                newUser.movecount = guestUser.movecount; // Assuming name is a field you want to transfer
                newUser.coins = guestUser.coins;
                newUser.powerups1 = guestUser.powerups1;
                newUser.powerups2 = guestUser.powerups2;
                newUser.powerups3 = guestUser.powerups3;
                newUser.levels = guestUser.levels;
                newUser.achievements = guestUser.achievements;
                 
            }

            await newUser.save();

            // Delete guest user
            if (guestUser) {
                await guestModel.deleteOne({ _id: guestUser._id });
            }

            const accessToken = generateAccessToken({ ...newUser });
            return res.send(success(200, { accessToken, isNewUser: true }));
        } 

        const accessToken = generateAccessToken({ ...existingUser });
        return res.send(success(200, { accessToken, isNewUser: false }));

    } catch (err) {
        return res.send(error(500, err.message));
    }
}
export async function facebookLoginController(req, res) {
    try {
        const { facebookID, deviceID ,phoneNo} = req.body;
        if (!facebookID && !phoneNo || !deviceID ) {
            return res.send(error(422, "insufficient data"));
        }
    
        // Find existing user with the same email
        const guestUser = await guestModel.findOne({ deviceID });
        
        var existingUser;
        if(facebookID){
             existingUser = await facebookModel.findOne({ facebookID });
        }
        else{
            existingUser = await facebookModel.findOne({ phoneNo });
        }

        
        if (!existingUser) {
            
            // Generate referral code only for new users
            const referralCode = generateUniqueReferralCode();
            const newUser = new facebookModel({  
                referralCode, 
                ...(phoneNo ? { phoneNo } : {}), 
                ...(facebookID ? { facebookID } : {}) 
            });
            

           
            // Transfer guest user data to authenticated user
            if (guestUser) {
                newUser.movecount = guestUser.movecount; // Assuming name is a field you want to transfer
                newUser.coins = guestUser.coins;
                newUser.powerups1 = guestUser.powerups1;
                newUser.powerups2 = guestUser.powerups2;
                newUser.powerups3 = guestUser.powerups3;
                newUser.levels = guestUser.levels;
                newUser.achievements = guestUser.achievements;
                 
            }

            await newUser.save();

            // Delete guest user
            if (guestUser) {
                await guestModel.deleteOne({ _id: guestUser._id });
            }

            const accessToken = generateAccessToken({ ...newUser });
            return res.send(success(200, { accessToken, isNewUser: true }));
        } 

        const accessToken = generateAccessToken({ ...existingUser });
        return res.send(success(200, { accessToken, isNewUser: false }));

    } catch (err) {
        return res.send(error(500, err.message));
    }
}
    export async function referAndEarnController(req,res){
  
          const currUser = req._id;
         
          const{referralCode} = req.body;
          try {
              const refferer = await userModel.findOne({referralCode}); 
              
              if(!refferer){
                  return res.send(error(404,"refferer user not found"));
              } 
              const reffered = await userModel.findById({_id:currUser});
              if(!reffered){
                  return res.send(error(404,"referred user not found"));
              }
              refferer.coins+=20;
              referrer.isReferred = true;
              await refferer.save();
              reffered.coins+=10;
              await reffered.save();
           return res.send(success(200,"you have earn 10 coins by referal successfully "));
              
          } catch (err) {
              return res.send(error(500,err.message));
          }
    }
    export async function updateUserController (req,res){
        try {
            const userID = req._id;
            const user = await userModel.findById(userID);
            user.isReferred = false;
            await user.save();
            return res.send(success(200,"user updated successfully"))
        } catch (err) {
            return res.send(error(500,err.message));
        }
    }
export async function getUserController(req,res){
    try {
        const currUserID = req._id;
        const user = await userModel.findOne({_id:currUserID}).populate('achivements').populate('levels');
        if(!user){
            return res.send(error(404,"user not found"));
        }
        return res.send(success(200,user));
    } catch (err) {
        return res.send(error(500,err.message));
    }
} 

export async function updateCoinController(req,res){
    const id =req._id;
    const Coins = req.body.Coins;
    try {
        const user =await userModel.findById(id);
        if(!user){
            return res.send(error(404,"user not found"));
        }
        user.coins +=Coins;
        await user.save();
        return res.send(success(200,"coins updated successfully"));

    } catch (err) {
        return res.send(error(500,err.message));
    }
}

export async function decreaseCoinsController(req,res){
    const id =req._id;
    const Coins = req.body.Coins;
    try {
        const user =await userModel.findById(id);
        if(!user){
            return res.send(error(404,"user not found"));
        }
        user.coins -=Coins;
        await user.save();
        return res.send(success(200,"coins updated successfully"));

    } catch (err) {
        return res.send(error(500,err.message));
    }
}
export async function updateVehiclePowerController(req,res){
    const id =req._id;
    const vehiclePower = req.body.vehiclePower;
    try {
        const user =await userModel.findById(id);
        if(!user){
            return res.send(error(404,"user not found"));
        }
        user.vehiclePower +=vehiclePower;
        await user.save();
        return res.send(success(200,"vehicle Power  updated successfully"));

    } catch (err) {
        return res.send(error(500,err.message));
    }
}

export async function decreaseVehiclePowerController(req,res){
    const id =req._id;
    const vehiclePower = req.body.vehiclePower;
    try {
        const user =await userModel.findById(id);
        if(!user){
            return res.send(error(404,"user not found"));
        }
        user.vehiclePower -=vehiclePower;
        await user.save();
        return res.send(success(200,"vehicle Power  updated successfully"));

    } catch (err) {
        return res.send(error(500,err.message));
    }
}


export async function getUnlockLevels(req,res){
    try {
        const id = req._id;
        const user = await userModel.findById(id);
        const unlockLevelcount = user?.levels?.length;
        return res.send(success(200,{unlockLevelcount}));
    } catch (err) {
        return res.send(error(500,err.message));
    }
}



export async function addMovesController(req,res){
    try {
        console.log("add moves");
        const {moves} = req.body;
        const id = req._id;
        const user = await userModel.findById(id);
        user.movecount+=moves;
        await user.save();
        return res.send(success(200,`${moves} moves added successfully`));
    } catch (err) {
        return res.send(error(500,err.message));
    }
}