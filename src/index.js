import _ from 'lodash';
import Message from './message';
import Attachment from './attachment';
import * as Attachers from './attachers';
import * as Commands from './commands';
import { usage, transform_opts } from './utils';

export { Message, Attachment, Attachers, Commands };

const debug = require( 'debug' )( 'slack-send:main' );

const opts = _.assign( {},
  Message.options,
  _.mapValues( Attachment.options, val => {
    return _.defaults( val, { group : 'Message Options' } );
  } ),
  Attachers.options,
  Commands.options,
);

export default function SlackSend( options, cb ) {
  debug( 'SlackSend', options, cb );
  if ( ! options || _.isString( options ) ) return Cli( options, cb );
  return new Message( transform_opts( options, opts ) );
}

export function Cli( cmdline, cb ) {
  debug( 'Cli', cmdline, cb );
  const yargs = require( 'yargs' )
    .help()
    .options( opts )
    .version( false )
    .completion( 'completion' );

  const argv = yargs.parse( cmdline || process.argv.slice( 2 ) );
  const args = transform_opts( argv, opts );

  if ( _.isEmpty( args ) ) usage( null, 1 );

  if ( Commands.handle( args, yargs ) ) return;
  try {
    ( new Message( args ) ).send( cb );
  } catch( err ) {
    usage( err, 1 );
  }
}
