// CHANGE 'nol' here to change the number of address 
// in request to 'http://btc.blockr.io/api/v1/address/info/'
// as well as to 'https://api.etherscan.io/api?module=account&action=balancemulti&address='
let nol = 20;

let mongoose = require("mongoose"),
    Agenda = require('agenda'),
    User = require('./models/user'),
    Total = require('./models/total'),
    XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest,
    mongoConnectionString = "mongodb://heroku_nlwlq2hc:vg4e8l6uuv0lvnrgh5jvgeonjh@ds061826-a0.mlab.com:61826,ds061826-a1.mlab.com:61826/heroku_nlwlq2hc?replicaSet=rs-ds061826",
// mongoConnectionString = "mongodb://nod_adm:backtothesky@ds057816.mlab.com:57816/nodio_crowd",
    agenda = new Agenda({db: {address: mongoConnectionString}});

mongoose.Promise = global.Promise;

console.log("connecting to db ...");
mongoose.connect(mongoConnectionString);
console.log("connected.");


agenda.define('update all wallets', function (job, done) {
    // console.log(Date.now());
    let summaryInvestedBTC = 0,
        summaryInvestedETH = 0,
        summaryInvested = 46.2017,
        link = 'http://btc.blockr.io/api/v1/address/info/',
        linkETH = 'https://api.etherscan.io/api?module=account&action=balancemulti&address=',
        xmlHttp = new XMLHttpRequest(),
        xmlHttpETH = new XMLHttpRequest(),
        xmlHttpCurrency = new XMLHttpRequest(),
        jsonResponses = [];

    // CURRENCY EXCHANGE RATE OF ETH -> BTC
    xmlHttpCurrency.open("GET", "https://www.cryptocompare.com/api/data/price?fsym=ETH&tsyms=BTC", false);
    xmlHttpCurrency.send(null);
    let response = JSON.parse(xmlHttpCurrency.responseText);
    let priceE_B = response.Data[0].Price;

    // console.log("Looking through USERs ...");
    User.find({}, function (err, users) {
        let userMap = {},
            userMapETH = {},
            wallets = [],
            walletsETH = [];

        // UPDATE WALLETS ARRAYS
        users.forEach(function (user) {
            // console.log("USER");
            // console.log(user);
            userMap[user.walletBTC] = user.investmentsBTC;
            userMap[user.walletETH] = user.investmentsETH;
            wallets.push(user.walletBTC);
            walletsETH.push(user.walletETH);
        });

        // console.log(userMap);
        // console.log(wallets);

        let links = makeLinks(nol, wallets, link),
            linksETH = makeLinks(nol, walletsETH, linkETH);

        // console.log("BTC updater for all users");

        for (let i = 0; i < links.length; i++) {
            xmlHttp.open("GET", links[i].replace(/(\\r|\\)/g, ""), false);
            xmlHttp.send(null);
            let response = JSON.parse(xmlHttp.responseText),
                accounts = response.data;

            // console.log(accounts);

            for (let j = 0; j < accounts.length; j++) {
                // console.log(accounts[j].address);
                if (accounts[j].address == "1NodaqpTFSxEfr5iN8niP25dxCv2kSWLoG") {
                    // console.log(accounts[j].address);
                    accounts[j].totalreceived += 2.4;
                }
                if (userMap[accounts[j].address] != accounts[j].totalreceived) {
                    updateUser(accounts[j].address, accounts[j].totalreceived, "BTC");
                }

                summaryInvestedBTC += accounts[j] != undefined ? accounts[j].totalreceived : 0;

                // console.log(accounts[j] != undefined ? accounts[j] : "undefined");
                // console.log(summaryInvested);
            }

        }

        // console.log("ETH updator for all users");
        for (let i = 0; i < linksETH.length; i++) {
            // console.log(linksETH[i]);
            xmlHttpETH.open("GET", linksETH[i].replace(/(\\r|\\)/g, ""), false);
            xmlHttpETH.send(null);
            let response = JSON.parse(xmlHttpETH.responseText),
                accounts = response.result;

            for (let j = 0; j < accounts.length; j++) {
                // FORMAT string NUMBERS (ie. "223435423") into balance (ie. "23.2342" or "0.0021"))
                let balanceNF = accounts[j].balance,
                    balance = 0;
                if (accounts[j].balance != "0") {
                    let amountArr = balanceNF.split("");
                    if (amountArr.length < 19) {
                        for (let d = 0; d < 22 - amountArr.length; d++)
                            amountArr.unshift("0");
                    }
                    amountArr.splice(-18, 0, ".");
                    // console.log(amountArr);
                    balance = amountArr.slice(0, -14).join("");
                    balance = parseFloat(balance);
                }

                if (userMapETH[accounts[j].account] != balance) {
                    updateUser(accounts[j].account, balance, "ETH");
                    // console.log("Write " + balance + "ETH")
                }

                summaryInvestedETH += balance != undefined ? balance : 0;
                summaryInvestedETH = parseFloat(summaryInvestedETH);
            }
        }

        users.forEach(function (user) {
            User.findOneAndUpdate(
                {_id:user._id},
                {investments: user.investmentsBTC + user.investmentsETH * priceE_B},
                function (err, affected, resp) {
                    if (err) return console.error(err);
                    // console.log("*********************************");
                    console.log(affected);
                    console.log(user.investmentsBTC + user.investmentsETH * priceE_B);
                }
            );
        });

        // TOTAL SUM OF ALL CURRENCIES in BTC currency
        summaryInvested += summaryInvestedBTC + summaryInvestedETH * priceE_B;

        Total.findOne({}, function (err, result) {
            if (err) {
                // console.log(err);
            }
            if (!result) {
                // console.log("Empty Total yet!");
                createTotal(summaryInvestedBTC, summaryInvestedETH, summaryInvested);
            } else {

                // updateTotalOne(summaryInvestedBTC, "BTC");
                updateTotal(summaryInvestedBTC, summaryInvestedETH, summaryInvested);
                console.log(summaryInvestedBTC);
                console.log(summaryInvestedETH);
                console.log(summaryInvested);
            }
        });

        function createTotal(new_scoreBTC, new_scoreETH, new_score_total) {
            let newScore = new Total({
                _id: "58077826aac9e83f99b01af9",
                totalInvestedBTC: new_scoreBTC,
                totalInvestedETH: new_scoreETH,
                totalInvested: new_score_total,
                lastUpdate: Date.now()
            });
            newScore.save(function (err, newScore) {
                if (err) return console.error(err);
            })
        }

        function updateTotalOne(new_score, currency) {
            let field = currency ? "totalInvested" + currency : "",
                date = Date.now(),
                query = {"_id": "58077826aac9e83f99b01af9"},
                update = {},
                options = {returnNewDocument: true};
            update[field] = new_score;
            update["lastUpdate"] = date;
            Total.findOneAndUpdate(query, update, options, function (err, total) {
                if (err) {
                    console.log(err);
                }
                // console.log('total');
            });
        }
        function updateTotal(new_score_btc, new_score_eth, new_score_total) {
            let date = Date.now(),
                query = {"_id": "58077826aac9e83f99b01af9"},
                update = {},
                options = {returnNewDocument: true};
            update["totalInvested"] = new_score_total;
            update["totalInvestedBTC"] = new_score_btc;
            update["totalInvestedETH"] = new_score_eth;
            update["lastUpdate"] = date;
            Total.findOneAndUpdate(query, update, options, function (err, total) {
                if (err) {
                    console.log(err);
                }
                // console.log('total');
            });
        }


        function updateUser(p_wallet, new_investments, currency) {
            let find = {},
                change = {},
                wallet = currency ? "wallet" + currency : "",
                investments = currency ? "investments" + currency : "";
            find[wallet] = p_wallet;
            change[investments] = new_investments;
            User.findOneAndUpdate(find, change,
                function (err, affected, resp) {
                    if (err) return console.error(err);
                    // console.log("*********************************");
                    // console.log(affected);
                });
        }

        function makeLinks(chunk, arr, base_link) {
            let i, j, temparray, links = [];

            for (i = 0, j = arr.length; i < j; i += chunk) {
                temparray = arr.slice(i, i + chunk);
                links.push(base_link + temparray.join(","));
            }
            return links;
        }

    });

    // console.log(Date.now());

    res.send("REFRESH IS MADE.");
    done();
});


agenda.on('ready', function () {
    // console.log("I am ready.")
    agenda.every('1 minute', 'update all wallets');
    // agenda.every('2 minutes', 'update all wallets');

    agenda.start();
})