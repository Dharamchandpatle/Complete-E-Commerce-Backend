const monsgoose = require("mongoose");
const validator = require("validator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto")

const userSchema = new monsgoose.Schema({
    name: {
        type: String,
        required: [true, "please Enter your name "],
        maxlength: [30, "Name cannot exceed 30 characters "],
        minlength: [4, "Name should have more than 4 characters "],

    },
    email: {
        type: String,
        required: [true, "Please Enter your Email "],
        unique: true,
        validate: [validator.isEmail, "Please Enter a valid Email "],
    },
    password: {
        type: String,
        required: [true, "Please Enter your password "],
        minlength: [8, "Password should have more than 8 characters "],
        select: false,
    },

    avatar: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true,
        }
    },
    role: {
        type: String,
        default: "user"
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,

});


// Yha parr hamne pswrd ko dcrypt kiya hai or esme if condition ("jab ham user,email change karte hai to pswrd change nhi honga baki ka smjh jaunga ")

userSchema.pre("save", async function (next) {

    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcryptjs.hash(this.password, 10)
})

// JWT TOKEN
userSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};



// compare password 
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcryptjs.compare(enteredPassword, this.password);

}



// Generating Password Reset Token 
userSchema.methods.getResetPasswordToken = function () {

    // Generating token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hashing and adding resetPasswordToken to userSchema
    this.resetPasswordToken = crypto
        .createHash("sha256")   // ye 1 prakar ka algorithm hai 
        .update(resetToken)
        .digest("hex");         // es se value hex me generate hoti hai 

    this.resetPasswordToken = Date.now() + 15 * 60 * 1000;

    return resetToken;
};


module.exports = monsgoose.model("user", userSchema)