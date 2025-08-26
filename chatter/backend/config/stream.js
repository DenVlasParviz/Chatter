import {StreamChat} from "stream-chat";

import {ENV} from "../config/env.js"
import * as stream from "node:stream";

const streamClient = StreamChat.getInstance(ENV.STREAM_API_KEY, ENV.STREAM_API_SECRET)

export const upsertStreamUser = async (userData) => {
    try {
        await streamClient.upsertUser(userData)
        console.log("Stream user upserted", userData.name)
        return userData
    } catch (e) {
        console.log(e)
    }
}


export const deleteStreamUser = async (userId) => {
    try {
        await streamClient.deleteUser(userId)
        console.log("Stream user deleted", userId)
    } catch (e) {
        console.log(e)
    }
}

export const genStreamToken = (userId)=>{
    try {
        const userIdString= userId.toString()
        return streamClient.createToken(userIdString)
    }catch(e) {
        console.log(e)
        return null
    }
}
 export const addUserToPublicChannels = async (newUserId)=>{
    const publicChannels = await streamClient.queryChannels({discoverable:true});
    for(const channel of publicChannels){
        await channel.addMembers([newUserId])
    }
 }
