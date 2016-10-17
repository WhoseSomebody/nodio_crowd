var mongoose = require("mongoose");
Agenda = require('agenda');
User = require('./models/user');
Total = require('./models/total');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var mongoConnectionString = "mongodb://nod_adm:backtothesky@ds057816.mlab.com:57816/nodio_crowd";
var agenda = new Agenda({db: {address: mongoConnectionString}});
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://nod_adm:backtothesky@ds057816.mlab.com:57816/nodio_crowd');


agenda.define('update all wallets', function(job, done) {
  User.find({},"_id wallet investments balance", function(err, users) {
    if (err) throw err;
    var updUsers = users,
        summaryInvested = 0,
        link = 'http://btc.blockr.io/api/v1/address/info/',
        xmlHttp = new XMLHttpRequest(),
        jsonResponses = [];
    console.log("step1");

    updUsers.forEach(function( user, i ){
      link += user.wallet != undefined ? user.wallet + "," : "";
      if (i%30 == 0 || i == updUsers.length%20) {
        xmlHttp.open( "GET", link.slice(0,-1) , false );
        xmlHttp.send( null );
        var response = JSON.parse(xmlHttp.responseText);
        summaryInvested += response.totalreceived;
        console.log("step2");

        if (response.data != undefined)
          if (response.data.length > 1)
            response.data.forEach(function(wallet, j ){
              console.log("step3");

              for(var t = 0; t < updUsers.length; t++)
              {
                if(updUsers[t].wallet == wallet.address)
                {
                  updUsers[t].balance = wallet.totalreceived;

                  User.update({wallet: updUsers[t].wallet}, {
                      investments: wallet.totalreceived, 
                      balance: wallet.balance
                  }, 
                  function(err, affected, resp) 
                  {
                    // console.log(resp);
                    summaryInvested += wallet.totalreceived;
                  });
                }
                link = 'http://btc.blockr.io/api/v1/address/info/';
              }       
          })
        }
      }
    );

  if (Total.find({totalInvested: summaryInvested})) {
    Total.findOneAndUpdate({
        totalInvested: summaryInvested,
        lastUpdate: Date.now
    },
    function(err, affected, resp) 
      {
        // console.log(resp);
      });
  } else {
    var newTotal = new Total({totalInvested: summaryInvested, lastUpdate: Date.now});
    Total.create(newTotal, function(error) {
      assert.ifError(error);
      var allTot = Total.find({});
      console.log(allTot);
    });
  }
  done();
});
});
agenda.on('ready', function() {
  agenda.every('3 minute','update all wallets');
  // agenda.every('2 minutes', 'update all wallets');

  agenda.start();
})