CSVParser.js
============

Works in browsers (optionally as an AMD module) or on the server.

Usage
-----

```js
parser = new Parser( csvData );

parser.array();            // get an array of arrays representing the data
parser.json();             // get an array of objects, using the first row as keys

parser
    .data( newCsvData )    // change data
    .delimiter( '\t' )     // change delimiter from comma to tab
    .qualifier( "'" );     // change qualifier from double to single quotes

parser.data();             // get current CSV data
parser.delimiter();        // get the current delimiter (defaults to ',')
parser.qualifier();        // get the current qualifier (defaults to '"')
```

License
-------

Copyright (c) 2013 [Rich Harris](http://rich-harris.co.uk) ([@rich_harris](http://twitter.com/rich_harris)).
Released under an MIT license.