const express = require('express'),
    session = require('express-session'),
    router = express.Router(),
    User = require('../models/user'),
    Total = require('../models/total'),
    Wallets = require('../models/wallets'),
    fs = require('fs'),
    readline = require('readline'),
    stream = require('stream'),
    XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest,
    helpers = require('utils'),
    password = require('password-hash-and-salt');
let wallet = {},
    walletsBTC,
    walletsETH,
    id;

Wallets.findOne({},
    function (err, doc) {
        if (err) console.log(err);
        walletsBTC = doc.numbers;
        walletsETH = doc.accountsETH;
        id = doc._id;
    }
);

//COUNT THE TOTAL SUM OF ALL USERS BTC INVESTMENTS
// User.find({}, function (err, users) {
//     let totalBTC = 0;
//     users.forEach((user) => {
//         totalBTC += user.investmentsBTC;
//         // console.log(user.investmentsBTC);
//     });
//     setTimeout(()=>{
//         console.log(totalBTC);
//     }, 500)
// });



router.get('*', function (req, res, next) {
    if (req.headers['x-forwarded-proto'] != 'https')
    if (req.headers.host != "localhost:3000")
        res.redirect('https://' + req.headers.host + req.url);
    else
        next();
    /* Continue to other routes if we're not redirecting */
});

router.post('/signup', (req, res, next) => {
    wallet["BTC"] = walletsBTC.splice(0, 1)[0];
    wallet["ETH"] = walletsETH.splice(0, 1)[0];

    Wallets.findOne({},
        function (err, doc) {
            doc.numbers.remove(wallet["BTC"]);
            doc.accountsETH.remove(wallet["ETH"]);
            doc.save();
        });
    let hash = helpers.saltSHA512(req.body.key);

    user = new User({
        walletBTC: wallet["BTC"],
        walletETH: wallet["ETH"],
        password: hash
    });

    user.generateId(function (err, name) {
        if (err) throw err;
        console.log('Your new id is ' + name);
    });


    user.save((err, user) => {
        if (err) throw err;

        req.session.userID = user._id;
        req.session.userWalletBTC = user.walletBTC;
        req.session.userWalletETH = user.walletETH;
        req.session.cookie.maxAge = 1000000;
        res.json({success: true});
    });
});

router.get('/update_schema_user', function (req, res, next) {

    User.find({}, function(err, users) {
        if (err) console.log(err);


        for (let i = 0; i < users.length; i++) {
            let user = users[i];
            let _walletBTC = user.wallet,
                walletETH,
                _investments = user.investments;
            // console.log(user);

            // TAKE A NEW ETH ADDRESS (FROM DB)
            walletETH = walletsETH.splice(0, 1)[0];
            Wallets.findOne({},
                function (err, doc) {
                    doc.accountsETH.remove(walletETH);
                    doc.save();
                }
            );

            console.log(_walletBTC);
            console.log(walletETH);
            User.update({_id:user._id},
                {
                    $set :
                    {
                        "walletBTC": _walletBTC,
                        "walletETH": walletETH,
                        "investmentsBTC": _investments,
                        "investmentsETH": 0
                    }
                }, function(error, usr) {
                    if (error) console.log(error);
                    console.log(usr);
                    // console.log(usr)
                }
            );
        }
    });

    res.json({success: true});


});

router.get('/', function (req, res, next) {
    let readyBTC = "", readyETH = "", ready = "";
    if (req.session.userID)
        res.redirect('/account');
    else {
        console.log(req.headers['user-agent']);
        let totalInvBTC = 0.0,
            totalInvETH = 0.0;
        totalInv = 0.0;
        Total.findOne({}, {}, {sort: {'lastUpdate': -1}}, function (err, doc) {
            // console.log(doc);
            totalInvBTC = doc == null ? 0 : doc.totalInvestedBTC;
            readyBTC = totalInvBTC == 0 ? 0 : helpers.format_numb(totalInvBTC);
            req.session.totalInvestedBTC = totalInvBTC;

            totalInvETH = doc == null ? 0 : doc.totalInvestedETH;
            readyETH = totalInvETH == 0 ? 0 : helpers.format_numb(totalInvETH);
            req.session.totalInvestedETH = totalInvETH;

            totalInv = totalInvBTC + convert_to_BTC(totalInvETH, "ETH");
            ready = helpers.format_numb(totalInv);
            req.session.totalInvested = totalInv;

            console.log(totalInv);
            console.log(totalInvBTC);
            console.log(totalInvETH);

            res.render('index', {
                title: "Nodio ♢ Crowd",
                totalBTC: readyBTC,
                totalETH: readyETH,
                total: ready
            });

        });
    }
});


router.get('/logout', (req, res) => {

    req.session.userID = null;
    req.session.userWalletBTC = null;
    req.session.userWalletETH = null;
    req.session.cookie.maxAge = 0;

    // res.redirect('/');
    // setTimeout(function() {
    res.json({session: "closed"});
    // }, 500);

});


router.get('/sesid', (req, res) => {
    if (req.session.userID)
        res.send(req.session.userID);
    else res.send('Session not set');
});

router.get('/btc-wallets-write-to-db', (req, res) => {
    let input = __dirname + '/../public/crowdsale_list.txt';
    content = fs.readFileSync(input, 'utf8');
    content = content.split("\n");

    Wallets.findOneAndUpdate(
        {},
        {numbers: content},
        (err, wallet) =>
        {
            if (err) {
                console.log(err);
            }
        }
    );

    // TO CREATE A NEW WALLET DOCUMENT
    //
    // let newWallets = new Wallets({
    //     numbers: content
    // });
    //
    // newWallets.save(function (err, newScore) {
    //     if (err) return console.error(err);
    //     console.log("WRITTEN");
    // });

    res.json({success: true});
});

router.get('/eth-wallets-write-to-db', (req, res) => {
    let input = __dirname + '/../public/eth_wallets.txt',
        content = fs.readFileSync(input, 'utf8');
    content = content.split("\n");

    Wallets.findOneAndUpdate(
        {},
        {accountsETH: content},
        (err, wallet) =>
        {
            if (err) {
                console.log(err);
            }
        }
    );

    res.json({success: true});
});

router.post('/login', function (req, res) {
    var hash = helpers.saltSHA512(req.body.key);

    if (hash)
        User.findOne({password: hash}, function (err, user) {

            if (user) {
                req.session.userID = user._id;
                req.session.userWalletBTC = user.walletBTC;
                req.session.userWalletETH = user.walletETH;
                req.session.cookie.maxAge = 1000000;
            }

            res.json({success: user != null});
        })
    else
        res.json({success: false});

});


router.post("/create-total-score", function (req, res, next) {
    var newScore = new Total({
        totalInvestedBTC: req.body.totalInvestedBTC,
        totalInvestedETH: req.body.totalInvestedETH,
        lastUpdate: Date.now
    });
    newScore.save(function (err, newScore) {
        if (err) return console.error(err);
    })
});

function convert_to_BTC(amount, cur_currency) {
    let link = "https://www.cryptocompare.com/api/data/price?fsym=" + cur_currency + "&tsyms=BTC",
        xmlHttpCurrency = new XMLHttpRequest();
    xmlHttpCurrency.open("GET", link, false);
    xmlHttpCurrency.send(null);
    let response = JSON.parse(xmlHttpCurrency.responseText);
    let priceE_B = response.Data[0].Price;
    // console.log(priceE_B);
    return amount*priceE_B;
}

module.exports = router;
