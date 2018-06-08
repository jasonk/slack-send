/* eslint import/no-extraneous-dependencies: off, no-console: off */
process.env.BABEL_ENV = process.env.NODE_ENV = 'test';

const _ = require( 'lodash' ),
  chai = require( 'chai' ),
  request = require( 'request' ),
  path = require( 'path' ),
  fs = require( 'fs' ),
  yargs = require( 'yargs' );

global._ = _;
global.chai = chai;
global.should = chai.should();
global.expect = chai.expect;

chai.use( require( 'chai-string' ) );
chai.use( require( 'chai-things' ) );

if ( ! process.env.SLACK_SEND_TEST_TOKEN ) {
  throw new Error( `You must set SLACK_SEND_TEST_TOKEN!` );
}
_.keys( process.env ).filter( x => {
  if ( x === 'SLACK_SEND_TEST_TOKEN' ) return false;
  return /^SLACK_SEND_/i.test( x );
} ).forEach( x => delete process.env[x] );

function payload( opts={} ) {
  const SlackSend = require( '../src' ).default;
  return SlackSend( opts ).getPayload();
}
function cksend( opts, msg_cb ) {
  const origin = require( '../src' );
  const token = process.env.SLACK_SEND_TEST_TOKEN;
  const msg = _.isString( opts )
    ? origin.Cli( opts, msg_cb )
    : origin.default( _.defaults( opts, { token } ) );
  msg.send( ( err, res, body ) => {
    console.log( 'HERE 1' );
    if ( err ) throw err;
    console.log( 'HERE 2' );
    if ( ! body || ! body.ok || ! body.ts ) {
      throw new Error( JSON.stringify( body ) );
    }
    console.log( 'HERE 3' );
    const ts = body.ts;
    const channel = body.channel;
    request( {
      uri       : 'https://slack.com/api/channels.history',
      method    : 'GET',
      json      : true,
      qs        : {
        channel     : channel,
        count       : 1,
        inclusive   : true,
        latest      : ts,
      },
      auth      : { bearer : token },
    }, ( err2, res2, msg ) => {
      if ( err2 ) throw err2;
      msg.should.have.property( 'ok', true );
      msg.should.have.property( 'latest', ts );
      msg.should.have.property( 'messages' );
      msg.messages.should.be.an( 'array' ).of.length( 1 );
      msg_cb( msg.messages[0] );
    } );
  } );
}
global.expath = path.resolve.bind( null, __dirname, '..', 'examples' );
function example( name, msg_cb ) {
  process.chdir( expath() );
  const opts = fs.readFileSync( expath( name ), 'utf8' )
    .replace( /^.*(debug-)?slack-send/ms, '' )
    .replace( /\s*\\\s*$/gsm, '' )
    .replace( /\s+/gs, ' ' )
    .replace( /(^\s+|\s+$)/g, '' );
  cksend( opts, msg_cb );
}

function ckprop( prefix, inprop, invalue, outprop, outvalue ) {
  if ( _.isNil( outvalue ) ) {
    outvalue = outprop;
    outprop = inprop;
  }
  const msg = payload( { [inprop] : invalue } );
  msg.should.have.nested.property( prefix + outprop, outvalue );
}
global.top_prop = ckprop.bind( null, '' );
global.att_prop = ckprop.bind( null, 'attachments[0].' );

_.assign( global, { payload, cksend, example } );
