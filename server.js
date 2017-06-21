// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var cors = require('cors');

app.use(cors());

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

var mongoose = require('mongoose');
var url = process.env.NODE_ENV === 'production' ? 
    'mongodb://reminderbot:ybhzZifp5MIeWhfPM3sSRt3bx8AdRqBcJsxWhzJOj3sBFxmzZ3hwrp7F6ZYyi5WcEboi40el1zZUiixt6AHBIg==@reminderbot.documents.azure.com:10255/?ssl=true&sslverifycertificate=false'
    : 'mongodb://127.0.0.1/reminder-api';
mongoose.connect(url); // connect to our database

var Reminder = require('./models/reminder');

var axios = require('axios');
function sendMessage(reminder, cb) {
    axios.post('https://self-reminder.herokuapp.com/listener', {
        user_id: reminder.user_id,
        message: reminder.message
    })
    .then(function (response) {
        cb(reminder);
    })
    .catch(function (err) {
        console.log(err)
    });
}

function updateReminder(reminder) {
    now = new Date();
    new_reminder = new Date(now.getTime() + parseInt(reminder.frequency));

    Reminder.findOneAndUpdate(
    { _id: reminder._id }, 
    { $set: { next_reminder: new_reminder }}, 
    { new: true }, 
    function(err, reminder) {
        if (err) {
            console.log(err);
        } else {
            console.log("Updated reminder after sending: %s", reminder);
        }
    });
}

function getRemindersToProcess() {
    console.log("Starting to process reminders...");
    var now = new Date();
    Reminder.find({next_reminder: { $lt: now }}, function(err, reminders) {
        if (err) {
            console.log(err);
            return;
        }

        for (var i = 0; i < reminders.length; i++) {
            var reminder = reminders[i];
            sendMessage(reminder, function(reminder) { updateReminder(reminder) });
        }
    });
}   

var cron = require('cron');
var job = new cron.CronJob('* * * * *', function() { 
    if (process.env.SEND_REMINDERS == '0') {
        return;
    }

    getRemindersToProcess();
}, null, true);

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // TODO logging
    next(); // make sure we go to the next routes and don't stop here
});


// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

// on routes that end in /reminders
// ----------------------------------------------------
router.route('/reminders')

    // create a reminder (accessed at POST http://localhost:8080/api/reminders)
    .post(function(req, res) {
        var reminder = new Reminder();      // create a new instance of the Reminder model
        reminder.user_id = req.body.user_id; 
        reminder.message = req.body.message;
        reminder.next_reminder = req.body.next_reminder;
        reminder.frequency = req.body.frequency;

        // save the reminder and check for errors
        reminder.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'Reminder created!' });
        });
    })

    // get all the reminders (accessed at GET http://localhost:8080/api/reminders)
    .get(function(req, res) {
        Reminder.find(function(err, reminders) {
            if (err)
                res.send(err);

            res.json(reminders);
        });
    });

// on routes that end in /reminders/:reminder_id
// ----------------------------------------------------
router.route('/reminders/:reminder_id')

    // get the reminder with that id (accessed at GET http://localhost:8080/api/reminders/:reminder_id)
    .get(function(req, res) {
        Reminder.findById(req.params.reminder_id, function(err, reminder) {
            if (err)
                res.send(err);
            res.json(reminder);
        });
    })

    // update the reminder with this id (accessed at PUT http://localhost:8080/api/reminders/:reminder_id)
    .put(function(req, res) {

        // use our reminder model to find the reminder we want
        Reminder.findById(req.params.reminder_id, function(err, reminder) {

            if (err)
                res.send(err);

            reminder.user_id = req.body.user_id;
            reminder.message = req.body.message;
            reminder.next_reminder = req.body.next_reminder;
            reminder.frequency = req.body.frequency;

            // save the reminder
            reminder.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'Reminder updated!' });
            });

        });
    })

    // delete the reminder with this id (accessed at DELETE http://localhost:8080/api/reminders/:reminder_id)
    .delete(function(req, res) {
        Reminder.remove({
            _id: req.params.reminder_id
        }, function(err, reminder) {
            if (err)
                res.send(err);

            res.json({ message: 'Successfully deleted' });
        });
    });

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
