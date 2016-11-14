var express = require('express');
var GoogleMapsAPI = require('googlemaps');
var cors = require('cors');
var app = express()
var port = process.env.PORT || 3000;
var request = require('request');

app.options('*', cors());

//Calling FlightStats API
app.get('/flightstats/', cors(), function (req, res) {
  var params = {
    appId: process.env.appId,
    appKey: process.env.appKey,
    departureAirport: req.query.departureAirport
  };

  var FLIGHT_URL = 'https://api.flightstats.com/flex/delayindex/rest/v1/json/airports/'

  var FLIGHT_URL2 = '?appId=' + params.appId + '&appKey=' + params.appKey;

  var requestUrl = `${FLIGHT_URL}${params.departureAirport}${FLIGHT_URL2}`;

  request( requestUrl, function (error, response, result) {
  if (!error && response.statusCode == 200) {
    var parsedResult = JSON.parse(result);
    res.json({
      "normalizedScore": parsedResult.delayIndexes[0].normalizedScore
      })
    };
  });

})

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

app.listen(port, function () {
  console.log('NSA is listening to port 3000!')
})
