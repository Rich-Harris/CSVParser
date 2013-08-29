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

}());