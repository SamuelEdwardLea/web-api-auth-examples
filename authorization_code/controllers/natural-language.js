var fs = require('fs');
var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
const {wat_key} = require('../config/index');


var nlu = new NaturalLanguageUnderstandingV1(wat_key);

const lyrics ='One man come in the name of love One man come and go One man come he to justifyOne man to overthrow';

function watson(lyrics, res){

  nlu.analyze(
    {
      html: lyrics, // Buffer or String
      features: {
        concepts: {},
        keywords: {},
        sentiment: {}
      }
    },
    function(err, response) {
      if (err) {
        console.log('error:', err);
      } else {
        let sentiment = response.sentiment.document.label;
        let obj = {};
        obj.sentiment = sentiment;
        obj.lyrics = lyrics;
        console.log(obj);
        // res.render('index', {obj});
      }
    }
  );
}

module.exports = {watson};

// res.render('pages/index', { staff });