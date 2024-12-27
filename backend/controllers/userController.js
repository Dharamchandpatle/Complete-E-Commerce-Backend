const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail")
const crypto = require("crypto")



//Register a user 
exports.registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.create({
            name,
            email,
            password,
            avatar: {
                public_id: 'this is a sample id',
                url: 'profilepicUrl',
            }
        });

        // const token = user.getJWTToken();
        // res.status(201).json({
        //     success: true,
        //     token,
        // })

        sendToken(user, 201, res)

    } catch (e) {
        console.log("Error while Register ", e.message);
        res.status(500).json({
            success: false,
            messag: "Internal server Error "
        });
    }

}


// Login User

exports.loginUser = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email }).select("+password");

        if (!user) {
            return next(new ErrorHandler("Invalid email or password", 401));
        }

        const isPasswordMatched = await user.comparePassword(req.body.password);

        if (!isPasswordMatched) {
            return next(new ErrorHandler("Invalid email or password", 401));
        }

        // jwt hai ye ...
        // const token = user.getJWTToken();
        // res.status(201).json({
        //     success: true,
        //     token,
        // })

        sendToken(user, 200, res);


    } catch (err) {
        console.log("Internal Server Error: ", err.message);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// LOgOut 
exports.logout = async (req, res, next) => {

    try {

        res.cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true

        });

        res.status(200).json({
            success: true,
            messag: "Logout Successfull"
        })

    } catch (err) {
        console.log("Internal Server Error ");
        res.status(500).json({
            success: false,
            message: " Internal server Error "
        })

    }
};


//Forgot Password 
exports.forgotPassword = async (req, res, next) => {
    try {

        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return next(new ErrorHandler("User not Found ", 404));

        }


        // Get ResetPassword Token
        const resetToken = user.getResetPasswordToken();

        await user.save({ validateBeforeSave: false });

        const resetPasswordUrl = `${req.protocol}://${req.get(
            "host"
        )}/password/reset/${resetToken}`;

        const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

        try {
            await sendEmail({
                email: user.email,
                subject: `Ecommerce Password Recovery`,
                message,
            });

            res.status(200).json({
                success: true,
                message: `Email sent to ${user.email} successfully`,
            });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({ validateBeforeSave: false });

            return next(new ErrorHandler(error.message, 500));
        }
    } catch (err) {
        console.log("Internal Server Error: ", err.message);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })

    }
};


// Reset Password 
exports.resetPassword = async (req, res, next) => {

    try {
        //creating token has
        const resetPasswordToken = crypto
            .createHash("sha256")
            .update(req.params.token)
            .digest("hex");

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }

        });

        if (!user) {
            return next(new ErrorHandler("Reset password token is invalid or has been expired", 400));
        }

        if (req.body.password !== req.body.confirmPassword) {
            return next(new ErrorHandler("Password does not match ", 400));

        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        sendToken(user, 200, res);

    } catch (err) {
        console.log("Internal Server Error: ", err.message);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

// Get User Detail (Ye khud ki detail dekhne ke liye hai )
exports.getUserDetail = async (req, res, next) => {

    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    })
}


// Update User password 
exports.updatePassword = async (req, res, next) => {

    try {

        const user = await User.findById(req.user.id).select("+password");

        const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

        if (!isPasswordMatched) {
            return next(new ErrorHandler("Old password is incorrect", 400));

        }

        if (req.body.newPassword != req.body.confirmPassword) {
            return next(new ErrorHandler("Password does not match ", 400));
        }

        user.password = req.body.confirmPassword;

        await user.save();

        sendToken(user, 200, res)

    } catch (err) {
        console.log("Internal Server Error: ", err.message);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }

}


// Update User Profile
exports.updateProfile = async (req, res, next) => {

    try {

        const newUserData = {
            name: req.body.name,
            email: req.body.email,
        };

        // We will add lkcloudinary later 

        const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
            new: true,
            runValidators: true,
            useFindAndModify: false

        });
        res.status(200).json({
            success: true,
            user
        });


    } catch (err) {
        console.log("Internal Server Error: ", err.message);
        res.status(500).json({
            success: false,
            message: "Internal Srver Error "
        })

    }

}


// Get All users (Admin):- Admin ke liye hai admin kisi bhi user ki detail dekh skta hai 
exports.getAllUsers = async (req, res, next) => {

    try {

        const users = await User.find();

        res.status(200).json({
            success: true,
            users
        });

    } catch (err) {
        console.log("Internal Server Error: ", err.message);
        res.status(500).json({
            success: false,
            message: "Internal Server Error "
        })

    }
}

// Get single users (Admin):- Admin ke liye hai admin kisi bhi user ki detail dekh skta hai 
exports.getSingleUsers = async (req, res, next) => {

    try {

        const user = await User.findById(req.params.id);

        if (!user) {
            return next(new ErrorHandler(`User does not exist with id : ${req.params.id}`))
        }

        res.status(200).json({
            success: true,
            user
        });

    } catch (err) {
        console.log("Internal Server Error: ", err.message);
        res.status(500).json({
            success: false,
            message: "Internal Server Error "
        })

    }
}



// Update User Role --Admin  
exports.updateUserRole = async (req, res, next) => {

    try {

        const newUserData = {
            name: req.body.name,
            email: req.body.email,
            role: req.body.role,
        };

        const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
            new: true,
            runValidators: true,
            useFindAndModify: false

        });
        res.status(200).json({
            success: true,
            user
        });


    } catch (err) {
        console.log("Internal Server Error: ", err.message);
        res.status(500).json({
            success: false,
            message: "Internal Srver Error "
        })

    }

}




// Delete User --Admin  
exports.deleteUser = async (req, res, next) => {

    try {

        const user = await User.findById(req.params.id);
        // We will remove cloudinary later 

        if(!user){
            return next(new ErrorHandler(`Userbdoes not exist with id : ${req.params.id}`));
        }
      
        await user.remove;

        res.status(200).json({
            success: true,
            message:"User deleted successfully "
        });


    } catch (err) {
        console.log("Internal Server Error: ", err.message);
        res.status(500).json({
            success: false,
            message: "Internal Srver Error "
        })

    }

}
