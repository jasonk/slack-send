import _ from 'lodash';
import Message from './message';
import Attachment from './attachment';
import * as Attachers from './attachers';
import * as Commands from './commands';
import { usage, transform_opts } from './utils';

export { Message, Attachment, Attachers, Commands };

const debug = require( 'debug' )( 'slack-send:main' );

const opts = _.mapValues( _.assign( {},
  Message.options,
  _.mapValues( Attachment.options, val => {
    return _.defaults( val, { group : 'Message Options' } );
  } ),
  Attachers.options,
  Commands.options,
), ( conf, name ) => {
  if ( ! conf.alias ) conf.alias = [];
  const names = _.uniq( _.compact( _.flattenDeep( [
    name, _.kebabCase( name ), conf.alias,
  ] ) ) );
  conf.alias = _.without( names, name );
  return conf;
} );

export default function SlackSend( options, cb ) {
  debug( 'SlackSend', options, cb );
  if ( ! options || _.isString( options ) ) return Cli( options, cb );
  const args = transform_opts( options, opts );
  debug( 'args', args );
  return new Message( args );
}

export function cliBuild( cmdline ) {
  debug( 'Cli', cmdline );
  const yargs = require( 'yargs' )
    .help()
    .options( opts )
    .version( false )
    .completion( 'completion' );

  const argv = yargs.parse( cmdline || process.argv.slice( 2 ) );
  const args = transform_opts( argv, opts );

  if ( _.isEmpty( args ) ) usage( null, 1 );

  debug( 'args', args );

  if ( Commands.handle( args, yargs ) ) return;
  try {
    return new Message( args );
  } catch( err ) {
    usage( err, 1 );
  }
}

export function cliSend( cmdline ) {
  const msg = cliBuild( cmdline );
  if ( ! msg ) return;
  msg.send( ( err, res, body ) => {
    if ( err ) throw err;
    if ( body.ok ) {
      console.log( body.ts );
    } else {
      console.error( body );
    }
  } );
}
