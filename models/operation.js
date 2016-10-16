const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var operationSchema = new Schema({
	_id: {type: String, unique: true},
    wallet: {type: String, unique: true},
    password: {type: String, unique: true},
    ballance: {type: String}
});

userSchema.methods.generateId = function() {
	var now = new Date();
	this._id  = now.getUTCFullYear().toString().slice(-2);
	this._id += (now.getMonth < 9 ? '0' : '') + (now.getMonth()+1).toString();
	this._id += (now.getDate < 10 ? '0' : '') + now.getDate().toString();
	this._id += now.getUTCMilliseconds().toString(30);
	this._id += now.getUTCMilliseconds().toString(36);
	return this._id;
};

var User = mongoose.model('User', userSchema);
module.exports = User;