var express = require('express');
var fs = require('fs');
var path = require('path');
var request = require('request');
var axios = require('axios');
var cheerio = require('cheerio');
var app = express();
var bodyParser = require('body-parser')

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

var options = {
  url: 'http://contracts.onecle.com/',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'
  }
};
var category = 'Business Formation';
// var subCategory = 'Administration Agreement';
// var subCategory = 'liquidity agreement';
// // var subCategories = ['custodial agreements',
// //   'asset management agreement',
// //   'asset purchase agreement',
// //   'asset transfer agreement',
// //   'deposit agreements',
// //   'liquidity agreement',
// //   'funding agreements',
// //   'Purchase Agreement',
// //   'Outsourcing Agreement',
// //   'escrow agreement',
// //   'Letter of Intent',
// //   'ISDA Master Agreement'];
var subCategories = ['Articles of Association',
  'Articles of Incorporation',
  'Bylaws',
  'Certificate of Incorporation',
  'LLC Agreement',
  'LLC Operating Agreement'];
let fileName = '';

subCategories.forEach(subCategory=> {
  let fileName = '';

  axios.get(options.url)
    .then((response)=> {
      var $ = cheerio.load(response.data);

      let tagForSubCategory = $('a').filter(function () {
        return $(this).text().trim().toLowerCase() === subCategory.toLowerCase();
      });
      let linkForSubCategory = tagForSubCategory[0].attribs.href;
      return axios.get(linkForSubCategory)

    })
    .then((response)=> {
      $ = cheerio.load(response.data);
      let listOfLinksToArticles = $('.row .index ul').last();
      let linkArcticle = 'http://contracts.onecle.com' + listOfLinksToArticles.children()[0].children[0].attribs.href;
      return axios.get(linkArcticle)
    })
    .then((response)=> {
      $ = cheerio.load(response.data);

      fileName = $('.col-sm-12 p')[1].children[0].data;
//
      let linkToFinalHtml = $('a').filter(function () {
        return $(this).text().trim() === 'printer-friendly';
      });
      linkToFinalHtml = linkToFinalHtml[0].attribs.href;
      return axios.get(linkToFinalHtml)
    })
    .then((response)=> {
      fs.existsSync("./" + category) || fs.mkdirSync("./" + category);
      fs.existsSync("./" + category + '/' + subCategory) || fs.mkdirSync("./" + category + '/' + subCategory);
      fs.writeFile("./" + category + '/' + subCategory + '/' + fileName + '.html', response.data, ()=> {
      });
      // res.send(response.data);
    })
})


app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});
app.post('/', function (req, res) {
  console.log(req.body);
  let subCategory = req.body.data;
  axios.get(options.url)
    .then((response)=> {
      var $ = cheerio.load(response.data);

      let tagForSubCategory = $('a').filter(function () {
        return $(this).text().trim().toLowerCase() === subCategory.toLowerCase();
      });
      let linkForSubCategory = tagForSubCategory[0].attribs.href;
      return axios.get(linkForSubCategory)

    })
    .then((response)=> {
      $ = cheerio.load(response.data);
      let listOfLinksToArticles = $('.row .index ul').last();
      let linkArcticle = 'http://contracts.onecle.com' + listOfLinksToArticles.children()[0].children[0].attribs.href;
      return axios.get(linkArcticle)
    })
    .then((response)=> {
      $ = cheerio.load(response.data);

      fileName = $('.col-sm-12 p')[1].children[0].data;
//
      let linkToFinalHtml = $('a').filter(function () {
        return $(this).text().trim() === 'printer-friendly';
      });
      linkToFinalHtml = linkToFinalHtml[0].attribs.href;
      return axios.get(linkToFinalHtml)
    })
    .then((response)=> {
      // fs.existsSync("./" + category) || fs.mkdirSync("./" + category);
      // fs.existsSync("./" + category + '/' + subCategory) || fs.mkdirSync("./" + category + '/' + subCategory);
      // fs.writeFile("./" + category + '/' + subCategory + '/' + fileName + '.html', response.data, ()=> {
      res.send(response.data);
    });
});

app.listen(process.env.PORT || 4000)



exports = module.exports = app;