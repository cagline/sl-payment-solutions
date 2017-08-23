// import { coreService } from '../../services';

const config = require('../../config/constant').application;
const unirest = require('unirest');

// Prepare Order
// module.exports.prepareOrder = coreService.prepareOrder;

/**
 * @param {any} req
 * @param {any} res
 * genarate access token for Dialog requests
 */
module.exports.genarateAccessToken = (req, res, next) => {
    unirest.post(config.PAYMENT.EZCASH.TOKEN_URL)
    .headers({
        'Authorization': 'Basic ' + new Buffer(config.PAYMENT.EZCASH.SECRET).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
    })
    .send({
        grant_type: config.PAYMENT.EZCASH.GRANT_TYPE,
        username: config.PAYMENT.EZCASH.USERNAME,
        password: config.PAYMENT.EZCASH.PASSWORD,
        scope: config.PAYMENT.EZCASH.SCOPE
    })
    .end((response) => {
        if(response.error){
            res.status(500).json({ error: response.error });
        }else{
            try{
                req.ezcahAccessToken = JSON.parse(response.body).access_token; next();
            }catch(ex){
                res.status(500).json({ error: ex});
            }
        }
    });
};

/**
 * @param {Object} ezCash response from the transaction request
 * @param {String} invoiceId invoice id for the transaction
 * This method watch the transaction status and return the requored information
 */
module.exports.paymentStatusChecker = (ezCashDataObj, invoiceId) => new Promise((ok, no) => {
    let retry = 0;
    // this can be done without watcher, but for testing perpose you can use this
    let watcher = setInterval(() => {
        unirest.post(config.PAYMENT.EZCASH.STATUS_VIEW_URL)
        .headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + req.ezcahAccessToken
        }).send({
            requesttransactionstatus: {
                ownerAlias : config.PAYMENT.EZCASH.OWNER_ALIAS,
                ownerPin : config.PAYMENT.EZCASH.OWNER_PIN,
                requestId : invoiceId
            }
        }).end((response) => {
            //  This implemenataion can be chnaged according to the requirements,
            if(response.body && response.body.getTransactionStatusViaRequestIdResponse){
                ok(response.body.getTransactionStatusViaRequestIdResponse.return.status);
            }else{
                no('') // Error will handle here
            }
        });
        retry++;
        if (retry > config.PAYMENT.EZCASH.MAX_RETRY) { // maximum retry is 1m
            clearInterval(watcher);
            no({ message: 'Timeout', status: 6 });
        }
    }, 1000);
});


module.exports.execTransaction = (req, res) => {
    if(!req.body.mobile)
        return res.status(404).json({ message: 'Content not found in the request body'});

    // get the mobile number from request body
    if (req.body.mobile.charAt(0) === '0') {
        req.body.mobile = req.body.mobile.substr(1);
    };

    // make the transaction
    unirest.post(config.PAYMENT.EZCASH.SUBMIT_TRANSACTION_URL)
    .headers({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + req.ezcahAccessToken // Token comming from accessToken genarator function
    })
    .send({
        agenttransactionrequest: Expoter.query.geteZCashRequest(req)
    })
    .end((ezResponse) => {
        if(ezResponse.error){
            res.status(500).json({error: ezResponse.error});
        }else{
            this.paymentStatusChecker(ezResponse.body, req).then(response => {
                var paymentStatus = config.PAYMENT.EZCASH.STATUES[response.status];
                // Process order
            }, error => {
                // Most probably timeout

            });
        }
    });
};