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
       
        const existingUser = await guestModel.findOne({ deviceID });
       
        if (existingUser) {
            // If the existing user is found, delete it
            await guestModel.deleteOne({ deviceID });
        }
       
        const referralCode = generateUniqueReferralCode();
          
        const newUser = await guestModel.create({ deviceID, referralCode });
        console.log(newUser);
        const accessToken = generateAccessToken({ ...newUser })
        return res.send(success(200, { accessToken, isNewUser: true }));
        
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
        const { facebookID, deviceID } = req.body;
        if (!facebookID &&  !deviceID ) {
            return res.send(error(422, "insufficient data"));
        }
    
        // Find existing user with the same email
        const guestUser = await guestModel.findOne({ deviceID });
        
        var existingUser;
        if(facebookID){
             existingUser = await facebookModel.findOne({ facebookID });
        }
       

        
        if (!existingUser) {
            
            // Generate referral code only for new users
            const referralCode = generateUniqueReferralCode();
            const newUser = new facebookModel({  
                referralCode, 
                facebookID
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
export async function referAndEarnController(req, res) {
    const currUser = req._id;
    const { referralCode } = req.body;
    try {
        const referrer = await userModel.findOne({ referralCode });
        if (!referrer) {
            return res.send(error(404, "referrer user not found"));
        }

        const referred = await userModel.findById(currUser);

        if (!referred) {
            return res.send(error(404, "referred user not found"));
        }

        // Store the original referral code of both referrer and referred
        const originalReferralCodeReferrer = referrer.referralCode;
        const originalReferralCodeReferred = referred.referralCode;

        // Perform the referral and earn operations
        referrer.coins += 20;
        // console.log(referrer);
        referrer.referedCount++;
        await referrer.save();

        referred.coins += 10;
        referred.isReferUsed = true;
        await referred.save();
        
        // Restore the original referral codes
        referrer.referralCode = originalReferralCodeReferrer;
        referrer.isReferred = true;
        await referrer.save();

        referred.referralCode = originalReferralCodeReferred;
        await referred.save();

        return res.send(success(200, {isReferred:true}));

    } catch (err) {
        return res.send(error(500, err.message));
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
    if (Coins<0){
        return res.send(error(400,"coins cannot be negative"));
    }
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
    if (Coins<0){
        return res.send(error(400,"coins cannot be negative"));
    }
    try {
        const user =await userModel.findById(id);
        if(!user){
            return res.send(error(404,"user not found"));
        }
        user.coins -=Coins;
        if (user.coins<0){
            return res.send(error(400,"coins cannot be negative"));
        }
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
        if(user.vehiclePower<0){
            return res.send(error(400,"vehicle power cannot be negative"));
        }
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

export async function getdetailController(req, res) {
    try {
        const allUsers = await userModel.find({}, { __v: 1,   });
        const totalUsers = await userModel.countDocuments();
        const zeroCount = await userModel.countDocuments({ __v: 0 });
        const oneCount = await userModel.countDocuments({ __v: 1 });
        const twoCount = await userModel.countDocuments({ __v: 2 });
        const threeCount = await userModel.countDocuments({ __v: 3 });
        const fourCount = await userModel.countDocuments({ __v: 4 });
        const fiveCount = await userModel.countDocuments({ __v: 5});
        const sixCount = await userModel.countDocuments({ __v: 6 });
        const sevenCount = await userModel.countDocuments({ __v: 7 });
        const eightCount = await userModel.countDocuments({ __v: 8});
        const nineCount = await userModel.countDocuments({ __v: 9 });
        const tenCount = await userModel.countDocuments({ __v: 10});
        const elevenCount = await userModel.countDocuments({ __v: 11 });
        const twelveCount = await userModel.countDocuments({ __v: 12 });
        const thirteenCount = await userModel.countDocuments({ __v: 13 });
        const fourteenCount = await userModel.countDocuments({ __v: 14 });
        const fifteenCount = await userModel.countDocuments({ __v: 15 });
        const sixteenCount = await userModel.countDocuments({ __v: 16 });
        const seventeenCount = await userModel.countDocuments({ __v: 17 });
        const eighteenCount = await userModel.countDocuments({ __v: 18 });
        const ninteenCount = await userModel.countDocuments({ __v: 19 });
        const twentyCount = await userModel.countDocuments({ __v: 20 });
        const twentyoneCount = await userModel.countDocuments({ __v:21});
        const twentytwoCount = await userModel.countDocuments({ __v: 22});
        const twentythreeCount = await userModel.countDocuments({ __v: 23 });
        const  twentyfourCount = await userModel.countDocuments({ __v: 24 });
        const  twentyfiveCount = await userModel.countDocuments({ __v: 25 });
        const  twentysixCount = await userModel.countDocuments({ __v: 26});
        
        

        return res.send( {
            totalUsers,
            zeroCount ,
            oneCount ,
           twoCount ,
            threeCount,
            fourCount,
            fiveCount ,
            sixCount,
            sevenCount ,
           eightCount ,
            nineCount ,
           tenCount,
         elevenCount,
           twelveCount ,
           thirteenCount ,
        fourteenCount ,
            fifteenCount,
        sixteenCount ,
          seventeenCount ,
          eighteenCount, 
           ninteenCount,
            twentyCount ,
          twentyoneCount ,
        twentytwoCount ,
           twentythreeCount ,
             twentyfourCount,
         twentyfiveCount,
             twentysixCount,

        });
    } catch (err) {
        return res.send(error(500, err.message));
    }
}
export async function updateInrController(req,res){
    try{
        const userID = req._id;
        const {referenceId,inrIncrease} = req.body;

        if( !referenceId || !inrIncrease){
            return res.send(error(400," Fill all the details"));
        }  
        const user = await userModel.findById(userID);
        if(!user){
            return res.send(error(404,"user not found"));
        }
        
    user.INR += inrIncrease;
    await user.save();

    return res.send(success(200,{message:"INR updated Sucessfully"}));
    } catch (err) {
        return res.send(error(500,err.message));
    
   }

}