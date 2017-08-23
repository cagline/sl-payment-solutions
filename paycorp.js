// import { coreService } from '../../services';

const config = require('../../config/constant').application;
const unirest = require('unirest');
const Client  = require('node-rest-client').Client;
const moment  = require('moment');
const Model = require('../../models');

// Prepare Order
// module.exports.prepareOrder = coreService.prepareOrder;

/**
 * 
 */
module.exports.getCardHeader = (data) => {
    const hash = crypto.createHmac('sha256', config.PAYMENT.CARD.HMAC_SECRET)
    .update(JSON.stringify(data))
    .digest('hex');
    return {
        "Content-Type": "application/json",
        "HMAC": hash,
        "AUTHTOKEN": config.PAYMENT.CARD.AUTHTOKEN
    }
};

module.exports.genarateAccessToken = (req, res) => {
    var client = new Client();
    var data = {
        "operation": "PAYMENT_INIT",
        "requestDate": moment().add('day').format('YYYY-MM-DD hh:mm:ss'),
        "validateOnly": false,
        "requestData": {
            "clientId": config.PAYMENT.CARD.CLIENT_ID,
            "type": "PURCHASE",
            "tokenize": false,
            "tokenReference": req.body.invoiceId,
            "amount": {
                "totalAmount": req.body.price,
                "paymentAmount": req.body.price,
                "currency": "LKR"
            },
            "redirect": {
                "returnUrl": config.PAYMENT.CARD.CALLBACK_URL,
                "returnMethod": "POST"
            },
            "clientRef": "asd",
            "comment": "sdfsd",
            "extraData": {
                "msisdn": "0432384947",
                "sessionId": "23423423"
            }
        }
    };
    var args = {
        data: data,
        headers: this.getCardHeader(data)
    };

    client.post(config.PAYMENT.CARD.BASE_URL, args, (data, response) => {
        if(data.responseData){
            var orderObj = data.responseData;
            orderObj.invoiceId = req.body.invoiceId;
            orderObj.orderedBy = req.user.id;
            data.responseData.csrfToken = data.responseData.reqid;
            res.status(200).json(data.responseData);
        }else{
            res.status(403).json({ message : 'Gateway not authorized the request' });
        }
    });
};

module.exports.paymentSuccess = (req, res) => {
    var client = new Client();
    var reqid = req.query.reqid || req.body.reqid;
    var clientRef = req.query.clientRef || req.body.clientRef;

    if(reqid && clientRef){
        var data = {
            "operation":"PAYMENT_COMPLETE",
            "requestDate" : moment().format('YYYY-MM-DD hh:mm:ss'),
            "validateOnly": false,
            "requestData":{  
                "clientId": config.PAYMENT.CARD.CLIENT_ID,
                "reqid": req.query.reqid
            }
        };
        var args = {
            data: data,
            headers: this.getCardHeader(data)
        };
        client.post(config.PAYMENT.CARD.BASE_URL, args, function (data, response) {
            // parsed response body as js object 
            console.log(JSON.stringify(data, null, 4));
            console.log(response.statusCode);

            if(response.statusCode == 200 && data.responseData){
                var { code, message } = config.CARD.PAYCORP.STATUES[data.responseData.responseCode];
                // Proceeds the order
            }
        });
    }
};

module.exports.populateUser = (req, res, next) => {
    Model.User.findOne({
        _id: req.user.id
    })
    .select('accountNo')
    .exec((error, response) => {
        if(error){
        }
        req.accountNo = response.accountNo;
        next();
    });
};