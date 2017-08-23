const config = require('../../config/constant').application;
const unirest = require('unirest');

/**
 * @param {any} req
 * @param {any} res
 */
module.exports.subscribeNumber = (req, res) => {
    if(!req.body.mobile)
        return res.status(404).json({ message: 'Content not found in the request body'});

    if (req.body.mobile.charAt(0) === '0') {
        req.body.mobile = req.body.mobile.substr(1);
    };

    unirest.post(config.PAYMENT.EZCASH.PIN_PAYMENT_URL)
    .headers({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + req.ezcahAccessToken
    })
    .send({
        "msisdn": "tel:+94" + req.body.mobile, // validate this feild ( this is only for testing )
        "description": "Payment for Grade5",
        "taxable": true,
        "callbackURL": null,
        "txnRef": "ABC-123",
        "amount": req.body.price
    })
    .end(response => {
        if(response.body.statusCode == 'SUCCESS'){
            res.status(200).json(response.body);
        }else{
            res.status(500).json(response.body);
        }
    });
};

/**
 *
 */
module.exports.submitPin = (req, res) => {
    unirest.post(config.PAYMENT.EZCASH.SUBMIT_PIN_URL)
    .headers({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + req.ezcahAccessToken
    })
    .send({
        "pin": req.body.pin,
        "serverRef": req.body.serverRef
    }).end(pinResponse => {
        if(pinResponse.body.data && pinResponse.body.statusCode == 'SUCCESS' && pinResponse.body.data.status == 'SUCCESS'){
            // Transaction done
        }else[
            // Transaction failed, Wrong PIN, Minimum credit etc.
        ]
    });
};