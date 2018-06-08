import _ from 'lodash';

export const commands = {};
export const options = {};
import { usage } from './utils';

export function handle( argv, yargs ) {
  for ( const [ key, fn ] of Object.entries( commands ) ) {
    if ( argv[ key ] ) {
      fn( argv, yargs );
      return true;
    }
  }
  return false;
}

export function create( name, handler, config ) {
  commands[ name ] = handler;
  options[ name ] = _.defaults( config, {
    type    : 'boolean',
    default : false,
    group   : 'Command Options',
  } );
}

create( 'version', handle_version, {
  type      : 'boolean',
  describe  : 'Show slack-send version',
  group     : 'Miscellaneous Options',
  default   : false,
} );

create( 'help', handle_help, {
  type      : 'boolean',
  describe  : 'Show help information',
  group     : 'Miscellaneous Options',
  default   : false,
} );

create( 'completion', handle_completion, {
  type      : 'boolean',
  describe  : 'Show bash completion script',
  group     : 'Miscellaneous Options',
  default   : false,
} );

function handle_help( argv, yargs ) {
  usage( null, 0 );
}

function handle_version( argv, yargs ) {
  console.log( require( '../package.json' ).version );
  process.exit( 0 );
}

function handle_completion( argv, yargs ) {
  yargs.showCompletionScript();
}
