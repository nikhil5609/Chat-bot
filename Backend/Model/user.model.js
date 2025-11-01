const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,   // minimum length
        maxlength: 40,  // maximum length
        trim: true
    },
    password: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        default: null,
        min: [0,"Age cannot be negative"],
        max: [100, "You are too old to use relax in bed now"]
    }
})

userSchema.statics.hashPassword = async function (password){
    return await bcrypt.hash(password,12);
}

userSchema.methods.checkPassword = async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateToken = async function (){
    const token = jwt.sign(
    { id: this._id, email: this.email },
    process.env.JWT_SECRET ,
    { expiresIn: '7d' }
  );
  return token;
}

const userModel = mongoose.model('User',userSchema);
module.exports = userModel