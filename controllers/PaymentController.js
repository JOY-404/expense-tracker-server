const Razorpay = require('razorpay');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const PREMIUM_MEMBERSHIP_AMT = 100;
const rzpayInstance = new Razorpay({ key_id: process.env.RAZOR_KEY_ID, key_secret: process.env.RAZOR_KEY_SECRET });

exports.postCreatePremOrder = (req, res, next) => {
    try {
        let orderCreated;
        req.user.createOrder({
            amount: PREMIUM_MEMBERSHIP_AMT,
            description: 'Premium Membership'
        })
            .then(order => {
                orderCreated = order;
                return rzpayInstance.orders.create({
                    amount: (parseFloat(order.amount) * 100).toString(),
                    currency: "INR",
                    receipt: order.id,
                    notes: {
                        userId: order.userId,
                        description: order.description
                    }
                });
            })
            .then(pmtGtwyOrder => {
                orderCreated.update({
                    gtwyOrderId: pmtGtwyOrder.id,
                    pmtStatus: pmtGtwyOrder.status,
                    pmtAttempts: pmtGtwyOrder.attempts
                })
                res.status(200).json({
                    success: true,
                    msg: 'Order Created Successfully',
                    pmtGtwyOrder: pmtGtwyOrder
                });
            })
            .catch(err => res.status(500).json({ success: false, msg: err }));
    }
    catch (err) {
        return res.status(500).json({ success: false, msg: err });
    }
};

exports.rzpaySuccess = (req, res, next) => {
    try {
        if (validatePaymentVerification(req.body.rzpay_order_id, req.body.rzpay_payment_id, req.body.rzpay_signature)) {
            // save order details
            req.user.getOrders({ where: { gtwyOrderId: req.body.rzpay_order_id } })
                .then(orders => {
                    const order = orders[0];
                    order.gtwyPmtId = req.body.rzpay_payment_id;
                    order.gtwySignature = req.body.rzpay_signature;
                    order.pmtStatus = 'success';
                    return order.save();
                })
                .then(resp => {
                    return req.user.update({
                        isPremiumMember: true
                    });
                })
                .then(resp => {
                    //console.log(resp.isPremiumMember);
                    const token = generateAccessToken({ id: req.user.id, isPremiumMember: resp.isPremiumMember });
                    res.status(200).json({ token: token, theme: resp.isPremiumMember, success: true, msg: 'Payment Received' });
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({ success: false, msg: err });
                });
        }
        else {
            res.status(401).json({ success: false, msg: 'Signature Mismatched' });
        }
    }
    catch (err) {
        return res.status(500).json({ success: false, msg: err });
    }
}

exports.rzpayFailure = (req, res, next) => {
    try {
        req.user.getOrders({ where: { gtwyOrderId: req.body.rzpay_order_id } })
            .then(orders => {
                const order = orders[0];
                order.gtwyPmtId = req.body.rzpay_payment_id;
                order.pmtStatus = 'failure';
                return order.save();
            })
            .then(resp => {
                res.status(200).json({ success: true, msg: 'Payment Tagged' });
            })
            .catch(err => res.status(500).json({ success: false, msg: err }));
    }
    catch (err) {
        return res.status(500).json({ success: false, msg: err });
    }
}

function validatePaymentVerification(orderId, pmtId, signature) {
    let body = orderId + '|' + pmtId;
    let expectedSignature = crypto.createHmac('sha256', process.env.RAZOR_KEY_SECRET).update(body).digest('hex');
    return expectedSignature == signature;
}

function generateAccessToken(det) {
    return jwt.sign(det, process.env.TOKEN_SECRET);
}