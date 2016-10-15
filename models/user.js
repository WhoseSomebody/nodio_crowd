const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var userSchema = new Schema({
    _id: {type: String, unique: true},
    password: {type: String, unique: true}
}, { _id: false });
userSchema.methods.generateId = function(phrase) {
	this._id = new Buffer(phrase).toString('base64');
	console.log(this._id);
	return this._id;
};

var User = mongoose.model('User', userSchema);
module.exports = User;