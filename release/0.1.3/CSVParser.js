// CSVParser.js v0.1.3
// ===================
//
// Usage examples:
//
//     parser = new Parser( csvData );
//
//     parser.array();            // get an array of arrays representing the data
//     parser.json();             // get an array of objects, using the first row as keys
//
//     parser
//         .data( newCsvData )    // change data
//         .delimiter( '\t' )     // change delimiter from comma to tab
//         .qualifier( "'" );     // change qualifier from double to single quotes
//
//     parser.data();             // get current CSV data
//     parser.delimiter();        // get the current delimiter (defaults to ',')
//     parser.qualifier();        // get the current qualifier (defaults to '"')
//
// ===================
//
// Copyright (c) 2013 Rich Harris (@rich_harris)
// Released under an MIT license.

;(function ( global ) {

	'use strict';

	var CSVParser,
		defaults,
		VERSION,
		LINE_FEED,
		CARRIAGE_RETURN_LINE_FEED,
		getDelimiter,
		newLinePattern,
		getNewline,
		getRows,
		getRow,
		getCell,
		getUnqualifiedCell,
		getQualifiedCell,
		whitespacePattern,
		allowWhitespace;

	VERSION = '0.1.3';

	defaults = {
		delimiter: ',',
		qualifier: '"',
		strict: true,
		trim: true
	};

	CSVParser = function ( data, options ) {
		var prop;

		if ( typeof data === 'string' ) {
			this.data( data );
		} else {
			this.data( '' );
			options = data;
		}

		if ( !options ) {
			options = {};
		}

		for ( prop in defaults ) {
			if ( defaults.hasOwnProperty( prop ) ) {
				this[ '_' + prop ] = options.hasOwnProperty( prop ) ? options[ prop ] : defaults[ prop ]; // prepend with _ to avoid collisions with method names
			}
		}
	};

	CSVParser.prototype = {
		delimiter: function ( delimiter ) {
			if ( !arguments.length ) {
				return this._delimiter;
			}

			this._delimiter = delimiter;
			this._arrayDirty = this._jsonDirty = true;

			return this;
		},

		qualifier: function ( qualifier ) {
			if ( !arguments.length ) {
				return this._qualifier;
			}

			if ( qualifier.length !== 1 ) {
				throw new Error( 'Qualifiers must be a single character, e.g. "' );
			}

			this._qualifier = qualifier;
			this._arrayDirty = this._jsonDirty = true;

			return this;
		},

		data: function ( data ) {
			if ( !arguments.length ) {
				return this._data;
			}

			this._data = data;
			this._arrayDirty = this._jsonDirty = true;

			return this;
		},

		array: function () {
			var tokenizer;

			if ( this._arrayDirty ) {
				tokenizer = {
					data: this._data,
					delimiter: this._delimiter,
					qualifier: this._qualifier,
					pos: 0,
					remaining: function () {
						return this.data.substring( this.pos );
					},
					char: function ( offset ) {
						return this.data.charAt( this.pos + ( offset || 0 ) );
					},
					strict: this._strict,
					trim: this._trim
				};

				this._array = getRows( tokenizer, this._strict ) || [];
				this._arrayDirty = false;
			}

			return this._array;
		},

		json: function () {
			var rows, headers;

			if ( this._jsonDirty ) {
				rows = this.array().slice();

				headers = rows.shift();

				this._json = rows.map( function ( row ) {
					var record = {}, i, len;

					len = row.length;
					for ( i=0; i<len; i+=1 ) {
						if ( row.hasOwnProperty( i ) && row[i] !== '' ) {
							record[ headers[i] ] = row[i];
						}
					}

					return record;
				});
				this._jsonDirty = false;
			}

			return this._json;
		}
	};

	LINE_FEED = '\n';
	CARRIAGE_RETURN_LINE_FEED = '\r\n';

	getDelimiter = function ( tokenizer ) {
		if ( tokenizer.char() === tokenizer.delimiter ) {
			tokenizer.pos += 1;
			return tokenizer.delimiter;
		}

		return null;
	};

	newLinePattern = /^\r?\n/;

	getNewline = function ( tokenizer ) {
		var remaining = tokenizer.remaining();

		if ( remaining.substr( 0, 2 ) === CARRIAGE_RETURN_LINE_FEED ) {
			tokenizer.pos += 2;
			return CARRIAGE_RETURN_LINE_FEED;
		}

		if ( remaining.charAt( 0 ) === LINE_FEED ) {
			tokenizer.pos += 1;
			return LINE_FEED;
		}

		return null;
	};

	getRows = function ( tokenizer ) {
		var rows, row, rowLength;

		if ( !tokenizer.data ) {
			return [];
		}

		row = getRow( tokenizer );

		if ( row ) {
			rows = [ row ];
		} else {
			return null;
		}

		rowLength = row.length;

		while ( getNewline( tokenizer ) && ( row = getRow( tokenizer ) ) ) {
			if ( tokenizer.strict ) {
				while ( row.length < rowLength ) {
					row[ row.length ] = '';
				}

				if ( row.length !== rowLength ) {
					throw new Error( 'Malformed data - all rows must have the same number of cells' );
				}
			}
			
			rows[ rows.length ] = row;
		}

		return rows;
	};

	getRow = function ( tokenizer ) {
		var row, cell;

		if ( !tokenizer.char() || newLinePattern.test( tokenizer.remaining() ) ) {
			return null;
		}

		row = [ getCell( tokenizer ) ];

		while ( getDelimiter( tokenizer ) ) {
			cell = getCell( tokenizer );
			row[ row.length ] = cell;
		}

		return row;
	};

	getCell = function ( tokenizer ) {
		var cell, cellData;

		if ( getNewline( tokenizer ) ) {
			return '';
		}

		cellData = getQualifiedCell( tokenizer ) || getUnqualifiedCell( tokenizer );

		if ( tokenizer.trim ) {
			cellData = cellData.trim();
		}
		
		try {
			cell = JSON.parse( cellData );
		} catch ( err ) {
			cell = cellData;
		}

		return cell;
	};

	getQualifiedCell = function ( tokenizer ) {
		var cellData, open, character, next, remaining;

		allowWhitespace( tokenizer );

		if ( tokenizer.char() !== tokenizer.qualifier ) {
			return null;
		}

		cellData = '';
		open = true;
		tokenizer.pos += 1;

		while ( open && ( character = tokenizer.char() ) ) {
			
			// if we encounter a qualifier...
			if ( character === tokenizer.qualifier ) {
				tokenizer.pos += 1;

				remaining = tokenizer.remaining();
				next = remaining[0];

				// it may be the closing qualifier
				if ( !next || next === tokenizer.delimiter || newLinePattern.test( remaining ) ) {
					open = false;
				}

				// ...it may be escaping the next character
				else if ( next === tokenizer.qualifier ) {
					cellData += next;
					tokenizer.pos += 1;
				}

				// otherwise it's not escaped but isn't closing the cell - it's not
				// RFC 4180 compliant but worse things happen at sea
				else {
					cellData += character;
				}
			}


			else {
				cellData += character;
				tokenizer.pos += 1;
			}
		}

		return cellData;
	};

	getUnqualifiedCell = function ( tokenizer ) {
		var remaining, cellData, delimiterIndex, crlfIndex, lfIndex, newLineIndex, lowestIndex;

		allowWhitespace( tokenizer );

		remaining = tokenizer.remaining();

		// find index of next delimiter
		delimiterIndex = remaining.indexOf( tokenizer.delimiter );

		// find index of next newline (which could be \r\n or \n)
		crlfIndex = remaining.indexOf( CARRIAGE_RETURN_LINE_FEED );
		lfIndex = remaining.indexOf( LINE_FEED );

		if ( crlfIndex === -1 ) {
			newLineIndex = lfIndex;
		} else if ( lfIndex === -1 ) {
			newLineIndex = crlfIndex;
		} else {
			newLineIndex = Math.min( crlfIndex, lfIndex );
		}

		// final cell?
		if ( ( delimiterIndex === -1 ) && ( newLineIndex === -1 ) ) {
			cellData = remaining;
			tokenizer.pos += cellData.length;
			return cellData;
		}

		if ( delimiterIndex === -1 ) {
			lowestIndex = newLineIndex;
		} else if ( newLineIndex === -1 ) {
			lowestIndex = delimiterIndex;
		} else {
			lowestIndex = Math.min( delimiterIndex, newLineIndex );
		}

		cellData = remaining.substr( 0, lowestIndex );

		tokenizer.pos += cellData.length;
		return cellData;
	};

	whitespacePattern = /^\s+/;

	allowWhitespace = function ( tokenizer ) {
		var remaining, match;

		remaining = tokenizer.remaining();
		match = whitespacePattern.exec( remaining );

		if ( match ) {
			tokenizer.pos += match[0].length;
		}
	};

	CSVParser.VERSION = VERSION;

	// shim for oldIE
	if ( !Array.prototype.map ) {
		Array.prototype.map = function ( mapper, context ) {
			var i, len, mapped = [];

			for ( i=0, len=this.length; i<len; i+=1 ) {
				if ( this.hasOwnProperty( i ) ) {
					mapped[i] = mapper.call( context, this[i], i, this );
				}
			}

			return mapped;
		};
	}

	if ( !String.prototype.trim ) {
		String.prototype.trim = function () {
			return this.replace( /^\s+/, '' ).replace( /\s+$/, '' );
		};
	}

	// export as CommonJS module...
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = CSVParser;
	}
	
	// ... or as AMD module...
	else if ( typeof define !== 'undefined' && define.amd ) {
		define( function () { return CSVParser; });
	}
	
	// ... or as browser global
	else {
		global.CSVParser = CSVParser;
	}

}( this ));