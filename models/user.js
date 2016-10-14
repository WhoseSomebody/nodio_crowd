const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var userSchema = new Schema({
    id: {type: String, unique: true},
    password: {type: String, unique: true}
});
userSchema.methods.generateId = function(phrase) {
	this.id = new Buffer(phrase).toString('base64');
	console.log(this.id);
	return this.id;
};

var User = mongoose.model('User', userSchema);
module.exports = User;