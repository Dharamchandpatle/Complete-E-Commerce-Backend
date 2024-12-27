const express = require("express");
const router = express.Router();

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const {
    neworder,
    getSingleOrder,
    myOrders,
    updateOrder,
    GetAllOrders,
    deleteOrder,

} = require("../controllers/orderControllers");


router.route("/order/new").post(isAuthenticatedUser, neworder)

router.route("/order/:id").get(isAuthenticatedUser, getSingleOrder);

router.route("/orders/me").get(isAuthenticatedUser, myOrders);

router.route("/admin/orders").get(isAuthenticatedUser, authorizeRoles("admin"), GetAllOrders)

router.route("/admin/order/:id").put(isAuthenticatedUser, authorizeRoles("admin"), updateOrder)
.delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOrder)


module.exports = router;