(function () {

	'use strict';

	// The following tests are derived from the specification maintained at
	// http://tools.ietf.org/html/rfc4180

	module( 'RFC 4180' );

	// 1.  Each record is located on a separate line, delimited by a line
	// break (CRLF).  For example:

	// aaa,bbb,ccc CRLF
	// zzz,yyy,xxx CRLF

	test( '1', function ( t ) {
		var parser = new CSVParser( 'aaa,bbb,ccc\r\nzzz,yyy,xxx\r\n' );

		t.deepEqual( parser.array(), [ [ 'aaa', 'bbb', 'ccc' ], [ 'zzz', 'yyy', 'xxx' ] ] );
	});

	// 2.  The last record in the file may or may not have an ending line
	// break.  For example:

	// aaa,bbb,ccc CRLF
	// zzz,yyy,xxx

	test( '2', function ( t ) {
		var parser = new CSVParser( 'aaa,bbb,ccc\r\nzzz,yyy,xxx' );

		t.deepEqual( parser.array(), [ [ 'aaa', 'bbb', 'ccc' ], [ 'zzz', 'yyy', 'xxx' ] ] );
	});

	// 3.  There maybe an optional header line appearing as the first line
	// of the file with the same format as normal record lines.  This
	// header will contain names corresponding to the fields in the file
	// and should contain the same number of fields as the records in
	// the rest of the file (the presence or absence of the header line
	// should be indicated via the optional "header" parameter of this
	// MIME type).  For example:

	// field_name,field_name,field_name CRLF
	// aaa,bbb,ccc CRLF
	// zzz,yyy,xxx CRLF

	// (Testing note - we can't have duplicate fields in JSON, hence field_name_1 etc)

	test( '3', function ( t ) {
		var parser = new CSVParser( 'field_name_1,field_name_2,field_name_3\r\naaa,bbb,ccc\r\nzzz,yyy,xxx\r\n' );

		t.deepEqual( parser.array(), [ [ 'field_name_1', 'field_name_2', 'field_name_3' ], [ 'aaa', 'bbb', 'ccc' ], [ 'zzz', 'yyy', 'xxx' ] ] );
		t.deepEqual( parser.json(), [{ field_name_1: 'aaa', field_name_2: 'bbb', field_name_3: 'ccc' }, { field_name_1: 'zzz', field_name_2: 'yyy', field_name_3: 'xxx' }] );
	});

	// 4.  Within the header and each record, there may be one or more
	// fields, separated by commas.  Each line should contain the same
	// number of fields throughout the file.  Spaces are considered part
	// of a field and should not be ignored.  The last field in the
	// record must not be followed by a comma.  For example:

	// aaa,bbb,ccc

	// 5.  Each field may or may not be enclosed in double quotes (however
	// some programs, such as Microsoft Excel, do not use double quotes
	// at all).  If fields are not enclosed with double quotes, then
	// double quotes may not appear inside the fields.  For example:

	// "aaa","bbb","ccc" CRLF
	// zzz,yyy,xxx

	test( '5', function ( t ) {
		var parser = new CSVParser( '"aaa","bbb","ccc"\r\nzzz,yyy,xxx' );

		t.deepEqual( parser.array(), [ [ 'aaa', 'bbb', 'ccc' ], [ 'zzz', 'yyy', 'xxx' ] ] );
	});

	// 6.  Fields containing line breaks (CRLF), double quotes, and commas
	// should be enclosed in double-quotes.  For example:

	// "aaa","b CRLF
	// bb","ccc" CRLF
	// zzz,yyy,xxx

	test( '6', function ( t ) {
		var parser = new CSVParser( '"aaa","b\r\nbb","ccc"\r\nzzz,yyy,xxx' );

		t.deepEqual( parser.array(), [ [ 'aaa', 'b\r\nbb', 'ccc' ], [ 'zzz', 'yyy', 'xxx' ] ] );
	});

	// 7.  If double-quotes are used to enclose fields, then a double-quote
	// appearing inside a field must be escaped by preceding it with
	// another double quote.  For example:

	// "aaa","b""bb","ccc"

	test( '7', function ( t ) {
		var parser = new CSVParser( '"aaa","b""bb","ccc"' );

		t.deepEqual( parser.array(), [ [ 'aaa', 'b"bb', 'ccc' ] ] );
	});

}());