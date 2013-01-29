var mongoose = require('mongoose');

var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;


mongoose.connect('mongodb://localhost/wchat');
var Message = mongoose.model('Message', new Schema({
    from: String,
    to: String,
    msg: String,
    date: { type: Date, default: Date.now },
    unreaded: {type: Boolean, default: true}
}), 'message');

exports.Message = Message;
