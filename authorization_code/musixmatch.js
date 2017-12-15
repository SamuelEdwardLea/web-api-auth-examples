const {key} = require('./config.js');
const request = require('request');
const fs  = require('fs');
const {watson} = require('./controllers/natural-language.js');
// const {watson} = require('./natural-language');

function getLyrics(query, res) {

  console.log(query);
  let artist = query.artist;
  let track = query.track;
  makeCall(artist,track, res);

 
}

function encode(str) {

  str = str.trim().toLowerCase();

  const reg = /\s/g;

  return str.replace(reg, '%20');

}

function makeCall(artist, track, res){

  console.log('is called initially...');
  artist = encode(artist);
  track = encode(track);
  request.get(`http://api.musixmatch.com/ws/1.1/track.search?apikey=${key.api_key}&q_artist=${artist}&q_track=${track}&format=json&page_size=1&f_has_lyrics=1`, {json:true},
    (err, musicReq, data) => {
      if(err) { console.log(err);}
      console.log(data);
      let trackId = data.message.body.track_list[0].track.track_id;

      request.get(`http://api.musixmatch.com/ws/1.1/track.lyrics.get?apikey=${key.api_key}&track_id=${trackId}`, {json: true},
        (err, musicReq, data) => {
          if(err) {console.log(err); }
          let lyrics = data.message.body.lyrics.lyrics_body;
          console.log(data.message.body.lyrics.lyrics_body,'*********');
          fs.writeFile(__dirname + '/db' + 'lyrics.json', data.message.body.lyrics.lyrics_body,(err) => {
            console.log(err);
          });
          return Promise.all(watson(lyrics, res)).then(result => { res.send({result});   });
          console.log(res.message.body.track_list.forEach(function(obj){
            console.log(obj);
          }));
        });               
    });

}

// makeCall('aerosmith', 'dream on');



module.exports = {getLyrics, makeCall};

// console.log(encode(string));
// http://api.musixmatch.com/ws/1.1/
// matcher.lyrics.get?q_track=sexy%20and%20i%20know%20it&q_artist=lmfao
//http://api.musixmatch.com/ws/1.1/track.search?apikey=MY_API_KEY&q_artist=queen&q_track=we%20are%20the%20champions&format=json&page_size=1&f_has_lyrics=1
//ANY GAP WE NEED %20
//track.lyrics.get?track_id=15953433

// `http://api.musixmatch.com/ws/1.1/track.search?apikey=${key.api_key}&q_artist=radiohead&q_track=no%20surprises&format=json&page_size=1&f_has_lyrics=1`