const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var walletsSchema = new Schema({
    numbers: [String]
});

var Wallets = mongoose.model('Wallets', walletsSchema);
module.exports = Wallets;