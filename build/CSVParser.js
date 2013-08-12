// CSVParser.js v0.1.1
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
		VERSION,
		getStringMatch,
		getRows,
		getRow,
		getCell,
		getUnqualifiedCell,
		getQualifiedCell,
		whitespacePattern,
		allowWhitespace;

	VERSION = '<%= version %>';

	CSVParser = function ( data ) {
		// defaults
		this._d = ',';
		this._q = '"';

		this.data( data || '' );
	};

	CSVParser.prototype = {
		delimiter: function ( delimiter ) {
			if ( !arguments.length ) {
				return this._d;
			}

			this._d = delimiter;
			this._arrayDirty = this._jsonDirty = true;

			return this;
		},

		qualifier: function ( qualifier ) {
			if ( !arguments.length ) {
				return this._q;
			}

			if ( qualifier.length !== 1 ) {
				throw new Error( 'Qualifiers must be a single character, e.g. "' );
			}

			this._q = qualifier;
			this._arrayDirty = this._jsonDirty = true;

			return this;
		},

		data: function ( data ) {
			if ( !arguments.length ) {
				return this._data;
			}

			this._data = data || '';
			this._arrayDirty = this._jsonDirty = true;

			return this;
		},

		array: function () {
			var tokenizer;

			if ( this._arrayDirty ) {
				tokenizer = {
					data: this._data,
					delimiter: this._d,
					qualifier: this._q,
					pos: 0,
					remaining: function () {
						return this.data.substring( this.pos );
					},
					nextChar: function () {
						return this.data.charAt( this.pos );
					}
				};

				this._array = getRows( tokenizer ) || [];
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

	getStringMatch = function ( tokenizer, string ) {
		if ( tokenizer.remaining().indexOf( string ) === 0 ) {
			tokenizer.pos += string.length;
			return string;
		}

		return null;
	};

	getRows = function ( tokenizer ) {
		var rows, row, rowLength;

		row = getRow( tokenizer );

		if ( row ) {
			rows = [ row ];
		} else {
			return null;
		}

		rowLength = row.length;

		while ( getStringMatch( tokenizer, '\n' ) && ( row = getRow( tokenizer ) ) ) {
			while ( row.length < rowLength ) {
				row[ row.length ] = '';
			}

			if ( row.length !== rowLength ) {
				throw new Error( 'Malformed data - all rows must have the same number of cells' );
			}
			
			rows[ rows.length ] = row;
		}

		return rows;
	};

	getRow = function ( tokenizer ) {
		var row, cell;

		cell = getCell( tokenizer );

		if ( cell ) {
			row = [ cell ];
		} else {
			return null;
		}

		while ( getStringMatch( tokenizer, tokenizer.delimiter ) ) {
			cell = getCell( tokenizer );
			row[ row.length ] = cell;
		}

		return row;
	};

	getCell = function ( tokenizer ) {
		var cell, cellData = getQualifiedCell( tokenizer ) || getUnqualifiedCell( tokenizer );
		
		try {
			cell = JSON.parse( cellData );
		} catch ( err ) {
			cell = cellData;
		}

		return cell;
	};

	getQualifiedCell = function ( tokenizer ) {
		var cellData, open, character, escaped;

		allowWhitespace( tokenizer );

		if ( tokenizer.nextChar() !== tokenizer.qualifier ) {
			return null;
		}

		cellData = '';
		open = true;
		tokenizer.pos += 1;

		while ( open && ( character = tokenizer.nextChar() ) ) {
			// if we have a qualifier, close the cell...
			if ( ( character === tokenizer.qualifier ) && !escaped ) {
				open = false;
			} else {
				// otherwise add the character
				cellData += character;
			}

			// if we have a \ character, escape the one after
			if ( escaped ) {
				escaped = false;
			} else if ( character === '\\' ) {
				escaped = true;
			}

			tokenizer.pos += 1;
		}

		return cellData;
	};

	getUnqualifiedCell = function ( tokenizer ) {
		var remaining, cellData, delimiterIndex, newLineIndex, lowestIndex;

		allowWhitespace( tokenizer );

		remaining = tokenizer.remaining();

		delimiterIndex = remaining.indexOf( tokenizer.delimiter );
		newLineIndex = remaining.indexOf( '\n' ); // TODO what about IE?

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