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
mongoose.connect('mongodb://localhost/reminder-api'); // connect to our database

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

// on routes that end in /bears
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


// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
