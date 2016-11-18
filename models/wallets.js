const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

let walletsSchema = new Schema({
    numbers: [String],
    accountsETH: [String]
});

let Wallets = mongoose.model('Wallets', walletsSchema);
module.exports = Wallets;