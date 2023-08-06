const HttpError = require("../models/http-error");
const jwt = require("jsonwebtoken")

module.exports = (req, res,next)=>{
    //Before doing any POST/PATCH request the browser send an OPTIONS request 
    //We dont want it to catch unauthorized here, as this type of request does
    //not carry the token
    if(req.method === "OPTIONS") {
        return next();
    }
    try{
        //Retrieve the token
        const token = req.headers.authorization.split(" ")[1]; //Authorization: 'Bearer TOKEN'
        if(!token){
            const error = new HttpError("Not authenticated", 401);
            return next(error)
        }
        //Check the token is right
        const decodedToken= jwt.verify(token, process.env.TOKEN_STRING);
        //Add data to the request
        req.usedData = {userId: decodedToken.userId}
        //Send it to the next route if not we sen error
        next();
    }catch (error){
        const err = new HttpError("Authentication failed", 401);
        return next(err)
    }
    

   

}