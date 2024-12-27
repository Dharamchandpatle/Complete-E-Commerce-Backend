const { param } = require("../app");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const ApiFeatures = require("../utils/apiFeatures");


// create Products --Admin 
exports.createProduct = async (req, res, next) => {

    req.body.user = req.user.id;

    try {
        const product = await Product.create(req.body);
        res.status(201).json({
            success: true,
            product
        })
    }
    catch (e) {
        console.log(e.message);
        res.status(500).json({
            status: false,
            message: " Internal server Error "
        })
    }

}

//Get All Product 
exports.getAllProducts = async (req, res) => {

    try {

        const resultPerPage = 5;
        const productCount = await Product.countDocuments();
        const apifeatures = new ApiFeatures(Product.find(), req.query)
            .search()
            .filter()
            .pagination(resultPerPage);
        const products = await apifeatures.query;
        res.status(200).json({
            success: true,
            products,
            productCount,
        })

    } catch (error) {
        console.log(e.message);
        res.status(500).json({
            status: false,
            message: "Internal server Error"
        })

    }

}

//Get Product Detail 
exports.getProductDetaials = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id)

        if (!product) {
            return next(new ErrorHandler("Product not Found ", 404))
        }

        res.status(200).json({
            success: true,
            product
        })

    } catch (e) {
        console.log(e.message);
        res.status(500).json({
            success: false,
            message: "Internal server Error"
        })

    }

}

//update product  --Admin 
exports.updateProduct = async (req, res, next) => {
    try {
        let product = await Product.findById(req.params.id);
        if (!product) {
            return next(new ErrorHandler("Product not Found ", 404))
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        });

        res.status(200).json({
            success: true,
            product
        })

    } catch (e) {
        console.log(e.message);
        res.status(500).json({
            success: false,
            message: "Internal server Error"
        })

    }
}


//Product delete --Admin
exports.deleteProduct = async (req, res, next) => {

    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return next(new ErrorHandler("Product not Found ", 404))
        }

        // await product.remove();
        res.status(200).json({
            success: true,
            message: "Product Delete Successfully "

        });


    } catch (e) {
        console.log("Error while found ", e.message);
        res.status(500).json({
            success: false,
            message: "Internal server Error"
        })

    }
}

// Create New Review or Update the review
exports.createProductReview = async (req, res, next) => {
    try {
        const { rating, comment, productId } = req.body;

        const review = {
            user: req.user._id,
            name: req.user.name,
            rating: Number(rating),
            comment,
        };

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        const isReviewed = product.reviews.find(
            (rev) => rev.user.toString() === req.user._id.toString()
        );

        if (isReviewed) {
            product.reviews.forEach((rev) => {
                if (rev.user.toString() === req.user._id.toString()) {
                    rev.rating = rating;
                    rev.comment = comment;
                }
            });
        } else {
            product.reviews.push(review);
            product.numOfReviews = product.reviews.length;
        }

        let avg = 0;

        product.reviews.forEach((rev) => {
            avg += rev.rating;
        });

        product.ratings = avg / product.reviews.length;

        await product.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
        });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({
            success: false,
            message: "Internal server Error",
        });
    }
};


//Get All Reviews of a product 
exports.getProductReviews = async (req, res) => {
    try {
        const product = await Product.findById(req.query.id);
        if (!product) {
            return next(new ErrorHandler("product not found ", 404));

        };
        res.status(200).json({
            success: true,
            reviews: product.reviews,
        })



    } catch (err) {
        console.log(err.message);
        res.status(500).json({
            success: false,
            message: "Internal server Error",
        });

    }
}



//Delete Reviews 
exports.deletReviews = async (req, res , next) => {
    try {

        const product = await Product.findById(req.query.id);
        if (!product) {
            return next(new ErrorHandler("product not found ", 404));
        };
        const reviews = product.reviews.filter(
            (rev) => rev._id.toString() !== req.query.id.toString()
        );

        let avg = 0;
        reviews.forEach((rev) => {
            avg += rev.rating;
        });

        const ratings = avg / reviews.length;

        const numOfReviews = reviews.length;

        await Product.findByIdAndUpdate(req.query.productId, {
            reviews,
            ratings,
            numOfReviews,
        }, {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });

        res.status(200).json({
            success: true,
            message: "Review deleted successfully",
        })





    } catch (err) {
        console.log(err.message);
        res.status(500).json({
            success: false,
            message: "Internal server Error",
        });

    }
}