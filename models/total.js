const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var totalSchema = new Schema({
	_id: {type: String, unique: true},
    totalInvested: {type: String, unique: true},
    totalInvestedBTC: {type: String, unique: true},
    totalInvestedETH: {type: String, unique: true},
    lastUpdate: {type: Date, default: Date.now}
}, {_id : false});

var Total = mongoose.model('Total', totalSchema);
module.exports = Total;