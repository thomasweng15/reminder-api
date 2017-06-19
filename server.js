// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

var mongoose = require('mongoose');
var url = process.env.NODE_ENV === 'production' ? 
    'mongodb://reminderbot:ybhzZifp5MIeWhfPM3sSRt3bx8AdRqBcJsxWhzJOj3sBFxmzZ3hwrp7F6ZYyi5WcEboi40el1zZUiixt6AHBIg==@reminderbot.documents.azure.com:10255/?ssl=true&sslverifycertificate=false'
    : 'mongodb://localhost/reminder-api';
mongoose.connect(url); // connect to our database

var Reminder = require('./models/reminder');

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
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
        reminder.name = req.body.name;  // set the reminder's name (comes from the request)

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

            reminder.name = req.body.name;  // update the reminder's info

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
