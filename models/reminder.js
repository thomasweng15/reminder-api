var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ReminderSchema = new Schema({
    name: String
});

module.exports = mongoose.model('Reminder', ReminderSchema);