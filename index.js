var express = require('express');
var GoogleMapsAPI = require('googlemaps');
var app = express()
var port = process.env.PORT || 3000;


app.get('/google', function (req, res) {
  var publicConfig = {
    key: 'AIzaSyAqpWjz6H7emmTezZQsDs3aqcovG5fqm4w',
    stagger_time:       1000, // for elevationPath
    encode_polylines:   false,
    secure:             true, // use https
  };
  var gmAPI = new GoogleMapsAPI(publicConfig);

  var params = {
          origin: 'Chicago, IL',
          destination: 'Evanston, IL'
        };

  gmAPI.directions( params, function(err, result){
    res.json({
      "duration": result.routes[0].legs[0].duration.text
    })
  });
})

app.listen(port, function () {
  console.log('NSA is listening to port 3000!')
})
