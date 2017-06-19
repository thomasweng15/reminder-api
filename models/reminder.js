var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ReminderSchema = new Schema({
    user_id: String,
    message: String,
    next_reminder: Date,
    frequency: String
});

module.exports = mongoose.model('Reminder', ReminderSchema);