import _ from 'lodash';
import YAML from 'js-yaml';
import fs from 'fs';

import {
  read_stdin, read_text, read_file, run_command, parse_text,
  transform_opts,
} from './utils';

const debug = require( 'debug' )( 'slack-send:utils' );

const handlers = {
  'stdin'       : read_stdin,
  'read-file'   : read_text,
  'read'        : read_text,
  'file'        : read_text,
  /* TODO - attach-file just includes a file as the text property
  'attach-file' : attach_file,
  'attach'      : attach_file,
  */
  'run-command' : run_command,
  'command'     : run_command,
  'run'         : run_command,
};

export const options = {};

export function create( name, handler, config ) {
  _.compact( _.flattenDeep( [ name, config.alias ] ) ).forEach( type => {
    handlers[ type ] = handler;
  } );
  options[ name ] = _.defaults( config, {
    group     : 'Attacher Options',
    array     : true,
  } );
}

create( 'stdin', read_stdin, {
  type      : 'boolean',
  describe  : 'Read attachments from stdin',
  default   : false,
  array     : false,
} );
create( 'read_file', read_file, {
  type      : 'string',
  describe  : 'Read attachments from file',
  alias     : [ 'read', 'file' ],
  normalize : true,
} );
create( 'run_command', run_command, {
  type      : 'string',
  describe  : 'Read attachments from command output',
  alias     : [ 'command', 'run' ],
} );

export function expand( opt ) {
  debug( `expanding`, opt );
  if ( _.isEmpty( opt ) ) {
    debug( `isEmpty, returning` );
    return;
  }
  const text = handle( opt );
  debug( `got text`, text );
  if ( ! text ) return opt;
  if ( ! _.isString( text ) ) return text;
  const data = parse_text( text );
  debug( `got data`, data );
  if ( _.isArray( data ) ) {
    return _.map( data, transform_opts );
  } else if ( _.isPlainObject( data ) ) {
    return transform_opts( data );
  } else {
    throw new Error( `Don't know how to parse data` );
  }
}

function handle( opt ) {
  if ( _.isPlainObject( opt ) ) {
    const keys = _.keys( opt );
    if ( keys.length === 1 ) {
      const key = keys[0];
      const handler = handlers[ key ];
      if ( handler ) {
        return handler( opt[ key ] );
      }
    }
  }
  if ( ! _.isString( opt ) ) return;

  const x = /^([a-z-]+)\s*:\s*(.*)$/.exec( opt );
  if ( x ) {
    const handler = handlers[ x[1] ];
    if ( handler ) return handler( x[2] );
    return;
  }
  if ( opt === '-' || opt === '@-' ) {
    return read_stdin();
  } else if ( opt[0] === '@' ) {
    return read_text( opt.substring( 1 ) );
  } else if ( opt[0] === '!' ) {
    return run_command( opt.substring( 1 ) );
  }
}
