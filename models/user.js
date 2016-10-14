const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

let userSchema = new Schema({
    id: {type: String, unique: true},
    password: {type: String, unique: true}
});
userSchema.methods.generateId = function(phrase) {
	this.id = new Buffer(phrase).toString('base64');
	console.log(this.id);
	return this.id;
};

let User = mongoose.model('User', userSchema);
module.exports = User;