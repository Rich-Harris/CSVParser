CSVParser.js
============

Usage
-----

```js
// Both arguments are optional. The csvData argument is a string
// representing the contents of a .csv file
parser = new Parser( csvData, options );

parser.array();          // get an array of arrays representing the data
parser.json();           // get an array of objects, using the first row as keys

parser
  .data( newCsvData )    // change data
  .delimiter( '\t' )     // change delimiter from comma to tab
  .qualifier( "'" );     // change qualifier from double to single quotes

parser.data();           // get current CSV data
parser.delimiter();      // get the current delimiter (defaults to ',')
parser.qualifier();      // get the current qualifier (defaults to '"')

// You can pass in the following initialisation options, with example values
parser = new CSVParser( csvData, {
  delimiter: '\t',       // defaults to ','
  qualifier: "'",        // defaults to '"',
  strict: false          // defaults to true - throws error with rows of uneven length
});
```

Compatibility
-------------

Works in browsers (optionally as an AMD module) or on the server. Browser support chart courtesy of [testling-ci](https://ci.testling.com/) (take any red flags with a pinch of salt, it's been tested succcessfully in all these browsers - sometimes Testling times out!):

[![browser support](https://ci.testling.com/Rich-Harris/CSVParser.png)](https://ci.testling.com/Rich-Harris/CSVParser)

The tests use the legacy build, which include [json2.js](https://github.com/douglascrockford/JSON-js/) - use this if you need to support older browsers and are not already including json2.js.

License
-------

Copyright (c) 2013 [Rich Harris](http://rich-harris.co.uk) ([@rich_harris](http://twitter.com/rich_harris)).
Released under an MIT license.
