const ErrorHandler = require("..//utils/errorhandler");

module.exports = (err , req , res , next )=>{
    res.statuscode = err.statuscode || 500 ;
    err.message = err.message || "Internal server error " ;

// wrong mongodb id error 
if(err.name === "CastError"){
    const message = `Resource not found . Invalid : ${err.path}` ;
    err = new ErrorHandler(message , 400) ;
}

// Mongoose duplicate key error 
if(err.code === 11000 ){
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered `;
    err = new ErrorHandler(message , 400) ;

}

// Wrong JWT Error 
if(err.name === "JsonWebTokenError"){
    const message = `Json Web Token is invailid , Try Again `;
    err = new ErrorHandler(message , 400) ;
    
}


    res.status(err.statuscode).json({
        success : false,
        message : err.message,
        // message : err.stack,
    })
}