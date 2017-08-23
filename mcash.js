
const appConfig = require('../../config/constant').application;
const unirest = require('unirest');

// Prepare Order
// module.exports.prepareOrder = coreService.prepareOrder;

/**
 * @param {any} req
 * @param {any} res
 * Genarate mCash access token for further requests
 */
module.exports.genarateAccessToken = (req, res) => {
    unirest.post(appConfig.PAYMENT.MCASH.TOKEN_URL)
    .headers({
        'Accept': 'application/json', 
        'Content-Type': 'application/json'
    })
    .send({
        merchant_id: appConfig.PAYMENT.MCASH.MERCHANT_ID,
        merchant_invoice_id: req.body.invoiceId,
        merchant_mobile: appConfig.PAYMENT.MCASH.MERCHANT_MOBILE,
        token_pwd: appConfig.PAYMENT.MCASH.TOKEN_PASSWORD,
        customer_mobile: req.body.mobile,
        amount: req.body.price,
        utility_account_number: appConfig.PAYMENT.MCASH.UTILITY_NUMBER
    })
    .end((response) => {
        if(response.error){
            // Process errors
        }else{
            var token = response.body;
            res.status(200).json(token);
        };
    });
};

/**
 * @param {any} req
 * @param {any} res
 * mCash callback to collect order status
 */
module.exports.mcashCallBack = (req, res) => {
    var { code, message } = appConfig.PAYMENT.MCASH.STATUES[req.body.status_code];
    var encriptedVerificationPassword = req.body.encrypted_verification_password;
    var sha256CheckSum = req.body.sha256_checksum;
    var invoiceId = req.body.invoice_id;
    if(code){
        // Process order status
    };
};

/**
 * @param {any} req
 * @param {any} res
 * mCash cancel will fire if user cancel the transaction
 */
module.exports.mcashCancel = (req, res) => {
    // Handle the cancell request
};

/**
 * @param {any} req
 * @param {any} res
 * mCash error will fire if there are any errors in mcash side
 */
module.exports.mcashError = (req, res) => {
    // Handle the errors
};