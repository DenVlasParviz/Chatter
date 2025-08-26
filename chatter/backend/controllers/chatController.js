
import {genStreamToken} from "../config/stream.js"

export const getStreamToken = async(req,res)=>{

    try{
const token = await genStreamToken(req.auth().userId)
        res.status(200).json({ token })
       }catch(err){
        console.log(err)
        res.status(500).json({status:"error",error:err})
    }
}
