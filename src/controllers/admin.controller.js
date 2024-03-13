import bcrypt from 'bcrypt';
import {error,success} from "../utills/responseWrapper.utill.js";
import { generateAccessToken } from '../services/generateAccessToken.service.js';
import adminModel from '../models/admin.model.js';
import  {userModel}  from '../models/user.model.js';
import createChallengeModel from '../models/admin.challenge.model.js';
export async function signupAdminController(req,res){
    try{

        const {username,email,password} = req.body;
        if(!username || !email || !password){
            return res.send(error(400,"all fields are required"));
       }

       const checkEmail = await adminModel.findOne({email});
       if(checkEmail){
           return res.send(error(400,"email already exist"));
        }

       const checkUsername = await adminModel.findOne({username});
       if(checkUsername){
        return res.send(error(400,"username already exist"));
       }

       
        const hashedPassword = await bcrypt.hash(password,10);
        req.body["password"] = hashedPassword;
        const user = await adminModel.create(req.body);
        const  newuser = await adminModel.findById(user._id);
        return res.send(success(200,"admin created"));

    } catch (err) {
        return  res.send(error(500,err.message));
    }
}


export async function loginAdminController(req,res){
    try {
        const {usernameOrEmail , password}= req.body;

        if(!usernameOrEmail,!password){
            return res.send(error(400,"all fields are needed"));
        }
        const user = await adminModel.findOne({$or:[{"username":usernameOrEmail},{"email":usernameOrEmail}]});
        if(!user){
            return res.send(error(404,"user not found"));
        }

        const matched = await bcrypt.compare(password,user.password);
        if(!matched){
            return res.send(error(401,"wrong password"));
        }

        const accessToken = generateAccessToken({...user});
        return res.send(success(200,{accessToken}));

    } catch (err) {
        return res.send(error(500,err.message));
    }
}

export async function getAllUsers(req,res){
    try {
        const users = await userModel.find({}).populate('achivements').populate('levels');
        return res.send(success(200,users));
    } catch (err) {
        return res.send(error(500,err.message));
    }
}

export async function createChallengeController(req,res){
    const {name,description,isActive,rewards,duration,challengetype,taskamount} = req.body
    try{
   if(!name || !description || !rewards || !duration || !challengetype || !taskamount){
        return res.send(404,"Insufficient Data")
    }

    const newChallenge = new createChallengeModel ({
        name, 
        description,
        isActive:isActive || true,
        rewards,
        duration,
        challengetype,
        taskamount
    })

    const savedChallenge = await newChallenge.save()

    return res.send(success(200,savedChallenge,"challenge created successfully",savedChallenge))
}catch (error){
    return res.send(500,err.message)
}
}

export async function getChallengeController(req,res){
    try{

        const challengeDetails = await createChallengeModel.find({})

        if(!challengeDetails){
            return res.send(error(404,"challenge not found"))
        }
        return res.send(success(200,challengeDetails,"challenge fetched successfully",challengeDetails))
    }catch(error){
        return res.send(500,error.message)
    }
}

export async function updateChallengeController(req,res){
 
    const {id} = req.params
    const {name,description,isActive,rewards,duration,challengetype,taskamount} = req.body
    try {
      const existingChallenge = await createChallengeModel.findById(id)

      if(!existingChallenge){
        return res.send(error(404,error.message))
      }
      if(name){
        existingChallenge.name = name;
      }
      if (description){
        existingChallenge.description = description;
      }
      if (isActive != undefined){
        existingChallenge.isActive = isActive;
      }
      if (rewards){
        existingChallenge.rewards = rewards;
      }
      if(duration){
        existingChallenge.duration = duration;
      }
      if(taskamount){
        existingChallenge.taskamount = taskamount;
      }
      if(challengetype){
        existingChallenge.challengetype = challengetype;
      }

      const updatedChallenge = await existingChallenge.save()

      return res.send(success(200,updatedChallenge,"challenge updated successfully",updatedChallenge))
    }catch(error){
        return res.send(error(500,err.message))
    }
}

export async function deleteChallengeController(req,res){
    try{
        const {id} = req.params
        await createChallengeModel.findByIdAndUpdate(id)
        return res.send(success(200,"challenge deleted successfully"))
    }catch(err){
        return res.send(500,err.message)
    }

}