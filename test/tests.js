(function () {

	'use strict';

	test( 'No data', function ( t ) {
		var parser = new CSVParser();

		t.deepEqual( parser.array(), [] );
		t.deepEqual( parser.json(), [] );
	});

	test( 'Comma-separated data', function ( t ) {
		var parser = new CSVParser( 'one,two,three\n1,2,3' );

		t.deepEqual( parser.array(), [ [ 'one', 'two', 'three' ], [ 1, 2, 3 ] ] );
		t.deepEqual( parser.json(), [{ one: 1, two: 2, three: 3 }] );
	});

	test( 'Tab-separated data', function ( t ) {
		var parser = new CSVParser( 'one\ttwo\tthree\n1\t2\t3' ).delimiter( '\t' );

		t.deepEqual( parser.array(), [ [ 'one', 'two', 'three' ], [ 1, 2, 3 ] ] );
		t.deepEqual( parser.json(), [{ one: 1, two: 2, three: 3 }] );
	});

	test( 'Tab-separated data with initialisation option', function ( t ) {
		var parser = new CSVParser( 'one\ttwo\tthree\n1\t2\t3', { delimiter: '\t' });

		t.deepEqual( parser.array(), [ [ 'one', 'two', 'three' ], [ 1, 2, 3 ] ] );
		t.deepEqual( parser.json(), [{ one: 1, two: 2, three: 3 }] );
	});

	test( 'Space-separated data', function ( t ) {
		var parser = new CSVParser( 'one two three\n1 2 3' ).delimiter( ' ' );

		t.deepEqual( parser.array(), [ [ 'one', 'two', 'three' ], [ 1, 2, 3 ] ] );
		t.deepEqual( parser.json(), [{ one: 1, two: 2, three: 3 }] );
	});

	test( 'Data with qualifiers', function ( t ) {
		var parser = new CSVParser( '"one,two,three","two",three\n123,2,3' );

		t.deepEqual( parser.array(), [ [ 'one,two,three', 'two', 'three' ], [ 123, 2, 3 ] ] );
		t.deepEqual( parser.json(), [{ 'one,two,three': 123, two: 2, three: 3 }] );
	});

	test( 'Cell containing newline', function ( t ) {
		var parser = new CSVParser( '"with\nnewline",two,three\n1,2,3' );

		t.deepEqual( parser.array(), [ [ 'with\nnewline', 'two', 'three' ], [ 1, 2, 3 ] ] );
		t.deepEqual( parser.json(), [{ 'with\nnewline': 1, two: 2, three: 3 }] );
	});

	test( 'Malformed data throws an error in strict mode', function ( t ) {
		var parser = new CSVParser( 'one,two,three\n1,2,3,4' ), errorThrown;

		try {
			parser.array();
		}

		catch ( err ) {
			errorThrown = true;
		}

		ok( errorThrown );
	});

	test( 'Malformed data doesn\'t throw an error in non-strict mode', function ( t ) {
		var parser = new CSVParser( 'one,two,three\n1,2,3,4', { strict: false }), errorThrown;

		try {
			parser.array();
		}

		catch ( err ) {
			errorThrown = true;
		}

		ok( !errorThrown );
	});

	test( 'Qualifiers in cells are only treated as qualifiers if they are followed by a delimiter or newline', function ( t ) {
		var parser = new CSVParser( 'one,two,three"four"five,"s"i"x"\n1,2,3"4"5,"6"' );

		t.deepEqual( parser.array(), [ [ 'one', 'two', 'three"four"five', 's"i"x' ], [ 1, 2, '3"4"5', 6 ] ] );
		t.deepEqual( parser.json(), [{ one: 1, two: 2, 'three"four"five': '3"4"5', 's"i"x': 6 }] );
	});

	test( 'Can initialise with options as the first (and only) argument', function ( t ) {
		var parser = new CSVParser({ delimiter: '\t' });

		parser.data( 'one\ttwo\tthree\n1\t2\t3' );

		t.deepEqual( parser.array(), [ [ 'one', 'two', 'three' ], [ 1, 2, 3 ] ] );
		t.deepEqual( parser.json(), [{ one: 1, two: 2, three: 3 }] );
	});

	test( 'Cells are trimmed by default', function ( t ) {
		var parser = new CSVParser( 'one ,two, three ," four  "\n1   , 2,3," 4 "' );

		t.deepEqual( parser.array(), [ [ 'one', 'two', 'three', 'four' ], [ 1, 2, 3, 4 ] ] );
		t.deepEqual( parser.json(), [{ one: 1, two: 2, three: 3, four: 4 }] );
	});

	test( 'Rows can have an empty first cell', function ( t ) {
		var parser = new CSVParser( 'one,two,three,four\n,,3,4' );

		t.deepEqual( parser.array(), [ [ 'one', 'two', 'three', 'four' ], [ '', '', 3, 4 ] ] );
		t.deepEqual( parser.json(), [{ three: 3, four: 4 }] );
	});

	test( 'Rows can have an empty final cell', function ( t ) {
		var parser = new CSVParser( 'one,two,three\n1,2,\n4,5,6' );

		t.deepEqual( parser.array(), [ [ 'one', 'two', 'three' ], [ 1, 2, '' ], [ 4, 5, 6 ] ] );
		t.deepEqual( parser.json(), [{ one: 1, two: 2 }, { one: 4, two: 5, three: 6 }] );
	});

	test( 'Regression test #1', function ( t ) {
		var parser = new CSVParser( 'id,name,address,lon,lat,zip\nMEW,Middlefield-Ellis-Whisman Study Area,,-122.0819,37.3894,\nKYD005009923,CALGON CARBON CORPORATION,"Big Sandy Plant, Route 23, Cattletsburg, KY",-82.591389,38.340278,41129' );

		t.deepEqual( parser.array(), [["id","name","address","lon","lat","zip"],["MEW","Middlefield-Ellis-Whisman Study Area","",-122.0819,37.3894,""],["KYD005009923","CALGON CARBON CORPORATION","Big Sandy Plant, Route 23, Cattletsburg, KY",-82.591389,38.340278,41129]]  );
		t.deepEqual( parser.json(), [{"id":"MEW","name":"Middlefield-Ellis-Whisman Study Area","lon":-122.0819,"lat":37.3894},{"id":"KYD005009923","name":"CALGON CARBON CORPORATION","address":"Big Sandy Plant, Route 23, Cattletsburg, KY","lon":-82.591389,"lat":38.340278,"zip":41129}]  );
	})

}());