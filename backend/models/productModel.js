const mongoose = require("mongoose")

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter Product Name "],
        trim: true
    },

    description: {
        type: String,
        required: [true, "Please Enter Product Description "]
    },
    price: {
        type: Number,
        required: [true, "Please Enter Product Price "],
        maxLength: [8, "price can't exceed 8 character"],
    },
    ratings: {
        type: Number,
        default: 0
    },
    images: [{

        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    }],

    category: {
        type: String,
        required: [true, "Please Enter Product Category "],
        // enum
    },

    stock: {
        type: Number,
        required: [true, "Please Enter Product Stock "],
        maxLength: [4, "Stock Can't exceed 4 characters"],
        default: 1
    },

    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required: true
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            Comment: {
                type: String,
                required: true
            }
        }
    ],

    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }


});

module.exports = mongoose.model("product", productSchema)
