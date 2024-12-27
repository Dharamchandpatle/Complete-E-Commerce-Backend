const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorhandler");

//creat new order 
exports.neworder = async (req, res, next) => {
    try {
        const {
            shippingInfo,
            orderItems,
            paymentInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        } = req.body;

        const order = await Order.create({
            shippingInfo,
            orderItems,
            paymentInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paidAt: Date.now(),
            user: req.user._id,
        });

        res.status(201).json({
            success: true,
            order,
        });


    } catch (e) {
        console.log(e.message);
        res.status(500).json({
            status: false,
            message: " Internal server Error "
        })
    }
}


// Get Single Order
exports.getSingleOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
        // .populate(
        //     "user",
        //     "name email"
        //   );

        if (!order) {
            return next(new ErrorHandler("Order not found with this Id", 404));
        }

        res.status(200).json({
            success: true,
            order,
        });

    } catch (e) {
        console.log(e.message);
        res.status(500).json({
            status: false,
            message: "Internal server Error"
        });
    }
};



// get logged in user  Orders
exports.myOrders = async (req, res, next) => {
    try {

        const orders = await Order.find({ user: req.user._id });

        res.status(200).json({
            success: true,
            orders,
        });

    } catch (e) {
        console.log(e.message);
        res.status(500).json({
            status: false,
            message: " Internal server Error "
        })
    }
};



// get All Orders   --Admin
exports.GetAllOrders = async (req, res, next) => {
    try {

        const orders = await Order.find();

        let totalAmount = 0;

        orders.forEach((order => {
            totalAmount += order.totalPrice;

        }));

        res.status(200).json({
            success: true,
            orders,
            totalAmount
        });

    } catch (e) {
        console.log(e.message);
        res.status(500).json({
            status: false,
            message: " Internal server Error "
        })
    }
};





// update Order Status -- Admin
exports.updateOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        
        if (!order) {
            return next(new ErrorHandler("Order not found with this Id", 404));
        }

        if (order.orderStatus === "Delivered") {
            return next(new ErrorHandler("You have already delivered this order", 400));
        }

        if (req.body.status === "Shipped") {
            order.orderItems.forEach(async (o) => {
                await updateStock(o.product, o.quantity);
            });
        }
        order.orderStatus = req.body.status;

        if (req.body.status === "Delivered") {
            order.deliveredAt = Date.now();
        }

        await order.save({ validateBeforeSave: false });
        res.status(200).json({
            success: true,
            message: "Order Updated Successfully "
        });

    } catch (e) {
        console.log(e.message);
        res.status(500).json({
            status: false,
            message: " Internal server Error "
        })
    }
};

async function updateStock(id, quantity) {
    const product = await Product.findById(id);

    product.stock -= quantity;

    await product.save({ validateBeforeSave: false });
};

// delete Order -- Admin
exports.deleteOrder = async (req, res, next) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {
            return next(new ErrorHandler("Order not found with this Id", 404));
        }

        res.status(200).json({
            success: true,
            message: "Order deleted successfully"
        });

    } catch (e) {
        console.error(e.message);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
