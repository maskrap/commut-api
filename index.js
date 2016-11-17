var express = require('express');
var GoogleMapsAPI = require('googlemaps');
var cors = require('cors');
var app = express()
var port = process.env.PORT || 3000;
var request = require('request');
var moment = require('moment');
moment().format();

app.options('*', cors());

//Google API
app.get('/google/', cors(), function (req, res) {
  var publicConfig = {
    key: 'AIzaSyAqpWjz6H7emmTezZQsDs3aqcovG5fqm4w',
    stagger_time:       1000, // for elevationPath
    encode_polylines:   false,
    secure:             true, // use https
  };
  var gmAPI = new GoogleMapsAPI(publicConfig);

  var params = {
          origin: req.query.origin,
          destination: req.query.destination
        };

  gmAPI.directions( params, function(err, result){
    res.json({
      "duration": result.routes[0].legs[0].duration.text
    })
  });
})

//TSA precheck
app.get('/precheck/', cors(), function (req, res) {
  var options = {
    url: "http://apps.tsa.dhs.gov/mytsawebservice/GetAirportCheckpoints.ashx",
    qs: {
      ap: req.query.ap,
      output: "json"
    }
  }

  request( options, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var parsedBody = JSON.parse(body);
    res.json({
        "precheck": parsedBody[0].airport.precheck
      }
      );
    };
  });
})

////////////////////////////FLIGHT STATS APIs//////////////////////////////////
////////////////////Calling FlightStats API for departure time
app.get('/departureTime/', cors(), function (req, res) {
  var params = {
    appId: '2f2f3e48',
    appKey: '5118cbf9ab0d0478039292e64eddfe3a',
    carrierCode: req.query.carrierCode,
    flightNumber: req.query.flightNumber
  };

  var thisDay = moment().format("DD");
  var thisMonth = moment().format("M");
  var thisYear = moment().format("YYYY");

  var FLIGHT_URL = 'https://api.flightstats.com/flex/flightstatus/rest/v2/json/flight/status' + '/' + params.carrierCode + '/' + params.flightNumber + '/arr/';

  var FLIGHT_URL2 = '?appId=' + params.appId + '&appKey=' + params.appKey;

  var requestUrl = `${FLIGHT_URL}${thisYear}/${thisMonth}/${thisDay}${FLIGHT_URL2}`;

  request( requestUrl, function (error, response, result) {
    if (!error && response.statusCode == 200) {
      var parsedResult = JSON.parse(result);
      res.json({
        "departureTimeString": parsedResult.flightStatuses[0].departureDate.dateLocal
      })
    };
  });
})



////////////////////Calling FlightStats API for delayTime
app.get('/delayTime/', cors(), function (req, res) {
  var params = {
    appId: '2f2f3e48',
    appKey: '5118cbf9ab0d0478039292e64eddfe3a',
    carrierCode: req.query.carrierCode,
    flightNumber: req.query.flightNumber
  };

  var thisDay = moment().format("DD");
  var thisMonth = moment().format("M");
  var thisYear = moment().format("YYYY");

  var FLIGHT_URL = 'https://api.flightstats.com/flex/flightstatus/rest/v2/json/flight/status' + '/' + 'QX' + '/' + '2081' + '/arr/';

  var FLIGHT_URL2 = '?appId=' + params.appId + '&appKey=' + params.appKey;

  var requestUrl = `${FLIGHT_URL}${thisYear}/${thisMonth}/${thisDay}${FLIGHT_URL2}`;
  request( requestUrl, function (error, response, result) {
    if (!error && response.statusCode == 200) {
      var parsedResult = JSON.parse(result);
        if (parsedResult.flightStatuses[2] == undefined ) {
          console.log("No delays");
        } else {
            res.json({
              "departureGateDelayMinutes": parsedResult.flightStatuses[2].delays.departureGateDelayMinutes,
              "departureRunwayDelayMinutes": parsedResult.flightStatuses[2].delays.departureRunwayDelayMinutes,
              "arrivalGateDelayMinutes": parsedResult.flightStatuses[2].delays.arrivalGateDelayMinutes,
              "arrivalRunwayDelayMinutes": parsedResult.flightStatuses[2].delays.arrivalRunwayDelayMinutes
            })
      }
    } else {
      console.log('Ya dun fucked up');
    };
  });
})

////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////Calling FlightStats API for resources
app.get('/gates/', cors(), function (req, res) {
  var params = {
    appId: '2f2f3e48',
    appKey: '5118cbf9ab0d0478039292e64eddfe3a',
    carrierCode: req.query.carrierCode,
    flightNumber: req.query.flightNumber
  };

  var thisDay = moment().format("DD");
  var thisMonth = moment().format("M");
  var thisYear = moment().format("YYYY");

  var FLIGHT_URL = 'https://api.flightstats.com/flex/flightstatus/rest/v2/json/flight/status' + '/' + params.carrierCode + '/' + params.flightNumber + '/arr/';

  var FLIGHT_URL2 = '?appId=' + params.appId + '&appKey=' + params.appKey;

  var requestUrl = `${FLIGHT_URL}${thisYear}/${thisMonth}/${thisDay}${FLIGHT_URL2}`;

  console.log(requestUrl);

  request( requestUrl, function (error, response, result) {
    if (!error && response.statusCode == 200) {
      var parsedResult = JSON.parse(result);
      res.json({
        "departureTerminal": parsedResult.flightStatuses[0].airportResources.departureTerminal,
        "departureGate": parsedResult.flightStatuses[0].airportResources.departureGate,
        "arrivalTerminal": parsedResult.flightStatuses[0].airportResources.arrivalTerminal,
        "arrivalGate": parsedResult.flightStatuses[0].airportResources.arrivalGate,
        "baggage": parsedResult.flightStatuses[0].airportResources.baggage
      })
    };
  });
})


app.listen(port, function () {
  console.log('NSA is listening to port 3000!')
})
