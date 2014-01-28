importScripts( '../../build/CSVParser.js' );

var parser, delimiters;

parser = new CSVParser();

delimiters = {
	comma: ',',
	tab: '\t',
	space: ' '
};

self.addEventListener( 'message', function ( event ) {
	var msg = event.data, max = 0, winner = 'comma';

	if ( msg.test ) {
		return;
	}

	parser.data( msg.data ).qualifier( msg.qualifier );

	[ 'comma', 'tab', 'space' ].forEach( function ( delimiter ) {
		var array, cellCount;

		try {
			array = parser.delimiter( delimiters[ delimiter ] ).array();
			cellCount = array.length * array[0].length;
		}

		catch ( err ) {
			cellCount = 0;
		}

		if ( cellCount > max ) {
			max = cellCount;
			winner = delimiter;
		}
	});

	self.postMessage( winner );
});