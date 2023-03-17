require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Requiring the necessary packages from node needed for the project
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dns = require('dns');
const urlParser = require('url');
const shortid = require('shortid');

// Basic Configuration
const port = process.env.PORT || 3000;

// Connecting to our MongoDB database
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });

// To check the status of the connection to our db
console.log(mongoose.connection.readyState)

// Creating our document data structure
let urlSchema = new mongoose.Schema({
  url: String,
    // Using short-id string instead of the longer one
    _id: {
    type: String,
    default: shortid.generate
  }
});

// Model
let Url = mongoose.model('Url', urlSchema);

app.use(cors());

// Parsing the URL-encoded data with the querystring library
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post("/api/shorturl", function(req, res) {
  console.log(req.body);
  const bodyUrl = req.body.url;
  
  // Parsing bodyUrl to just be the host name for dns to look up
  const https = dns.lookup(urlParser.parse(bodyUrl).hostname,
  function(err, validAddress) {
    if (!validAddress) {
      res.json({ error: "Invalid URL"})
    } else {
      const url = new Url({ url: bodyUrl })
        url.save(function(err, address) {
        res.json({ original_url: address.url, short_url: address.id })
      })
    }
  }) ;     
});

app.get("/api/shorturl/:id", function(req, res) {
  const id = req.params.id;
  Url.findById(id, function(err, data) {
    if(err) {
      res.json({ error: "Invalid URL" })
    } else {
      res.redirect(data.url)
    }
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
