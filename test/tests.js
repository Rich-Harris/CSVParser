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

	test( 'Malformed data throws an error', function ( t ) {
		var parser = new CSVParser( 'one,two,three\n1,2,3,4' ), errorThrown;

		try {
			parser.array();
		}

		catch ( err ) {
			errorThrown = true;
		}

		ok( errorThrown );
	});

}());