const getLogin = (req,res) => {
    
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
};

module.exports  = {getLogin};