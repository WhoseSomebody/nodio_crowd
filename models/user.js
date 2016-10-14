const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

let userSchema = new Schema({
    id: {type: String, unique: true},
    password: {type: String, unique: true}
});

let User = mongoose.model('User', userSchema);
module.exports = User;