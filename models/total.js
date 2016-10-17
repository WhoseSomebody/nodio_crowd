const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var totalSchema = new Schema({
	_id: {type: String, unique: true},
    totalInvested: {type: String, unique: true},
    lastUpdate: {type: Date, default: Date.now}
});

var Total = mongoose.model('Total', totalSchema);
module.exports = Total;