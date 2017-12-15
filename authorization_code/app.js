/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
const {getLyrics, makeCall} = require('./musixmatch.js');

var client_id = '04cf88e129804607a7a13efef6e39cfe'; // Your client id
var client_secret = 'c78bdb916f804abd87f62461c011c0c0'; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

// app.set('view engine', 'ejs');

// app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static(__dirname + '/public'))
  .use(cookieParser());

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email playlist-read-private user-library-read user-read-recently-played';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
          refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me/player/recently-played?limit=50',
          
          // url: 'https://api.spotify.com/v1/users/jenniredfield/playlists',
          // url: 'https://api.spotify.com/v1/users/jenniredfield/playlists/1hedinXHi1Q7iMLJpxfRlR/tracks',
          
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };


        
        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          // console.log(body);
          let artistName = (body.items[0].track.album.artists[0].name);
          let songName = (body.items[0].track.album.name);

          makeCall(artistName, songName, res);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

app.get('/lyrics',(req,res) => {
  // read file with lyrics
  // watson interaction
  // res.send data
});

console.log('Listening on 8888');
app.listen(8888);


// app
//   .get('https://api.spotify.com/v1/me')
//   .then(function(data) {
//     console.log(data); 
//   })
//   .catch(function(err) {
//     console.error('Error occurred: ' + err); 
//   });


// var Spotify = require('node-spotify-api');
// const request = require('superagent');
// const fs = require('fs');
// const path = require('path');

// var spotify = new Spotify({
//   id: '04cf88e129804607a7a13efef6e39cfe',
//   secret: 'c78bdb916f804abd87f62461c011c0c0'
// });




// //MOSTRECENT

// const access_token = 'BQBKnXnJVNl4ObPakejT98m-xar9tbzIhDjRX7WA09dqYzuzfeRxzVEjr_i_-Bn61TvdPjdSw7B0Ah1IvSJ-mTDklQAA1DqhJcpjm3jaypUA80ou_MCcoFQPgFvPx2oUFW4up2qPssmXbpg8OzKkfrfCFiFZQhR1';

// app.get('/user-playlists', function(req, res){
  
//   var options = {
//     url: 'https://api.spotify.com/v1/me',
//     headers: {
//       'Authorization': 'Bearer ' + access_token
//     },
//     json: true
//   };

  
//   console.log(res.body);

// });




  
// req(options).then(function(body) {
//   var userId = body.id;
//   var options = {
//     url: 'https://api.spotify.com/v1/users/' + userId + '/playlists',
//     headers: {
//       'Authorization': 'Bearer ' + access_token
//     },
//     json: true
//   };
//   return req(options).then(function (body) {
//     var playlists = body.items;
//     res.json(playlists);
//   });
// }).catch(function (err) {
//   console.log(err);
// });
  

