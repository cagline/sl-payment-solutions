
const config = require('../../config/constant').application;
const unirest = require('unirest');

/**
 * 
 */
module.exports.redirectToVishwa = (req, res) => {
    res.status(200).json({url: config.PAYMENT.SAMPATH_VISHWA.INIT_URL + '&MD=P&PID='+ config.PAYMENT.SAMPATH_VISHWA.PID +'&PRN='+req.body.invoiceId+'&AMT='+req.body.price+'&CRN=LKR&RU='+ config.PAYMENT.SAMPATH_VISHWA.CALLBACK_URL});
};

/**
 * 
 */
module.exports.vishwaCallback = (req, res) => {
    req.body.price = '1.00';
    if(req.query.PAID == 'Y'){
        unirest
        .get(config.PAYMENT.SAMPATH_VISHWA.VERIFY_URL + '&MD=V&PID='+ config.PAYMENT.SAMPATH_VISHWA.PID +'&PRN='+req.query.PRN+'&TRN='+req.query.BID+'&AMT='+req.body.price)
        .end((response) => {
            const cheerio = require('cheerio')
            const $ = cheerio.load(response.body);
            var key = ($('p').text().replace(/\s+/, "")).replace(/\s+/, "").replace(/\t/g, '').replace(/\n/g, '');
            if(key.startsWith("ACCEPT")){
                if(key.split("ACCEPT")[1] == 'Y'){
                    // 
                    res.status(200).json({ message: 'Transaction successfull'});
                }else{
                    // this.processPaymentError(req);
                    res.status(200).json({ message: 'Transaction failed'});
                }
            }else{
                // this.processPaymentError(req);
            }
        });
    }else{
        // this.processPaymentError(req);
    }
};