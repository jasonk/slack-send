import _ from 'lodash';
import YAML from 'js-yaml';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const debug = require( 'debug' )( 'slack-send:utils' );

export function get_environment() {
  const opts = {};
  _.each( process.env, ( val, key ) => {
    if ( ! /^SLACK_SEND_/i.test( key ) ) return;
    key = key.replace( /^SLACK_SEND_/i, '' ).toLowerCase();
    opts[ key ] = val;
  } );
  if ( process.env.SLACK_TOKEN && ! opts.token ) {
    opts.token = process.env.SLACK_TOKEN;
  }
  return opts;
}

export function gravatar_url( email ) {
  if ( ! /@/.test( email ) ) return email;
  const crypto = require( 'crypto' );
  const md5 = crypto.createHash( 'md5' );
  const hash = md5.update( email.toLowerCase() ).digest( 'hex' );
  return `https://www.gravatar.com/avatar/${hash}?s=16&d=404`
}

export function translate_color( color, mapfile ) {
  if ( ! color ) return;
  if ( ! mapfile ) mapfile = path.resolve( __dirname, 'color-map.yaml' );
  const map = read_file( mapfile );
  return map[ color ] || color;
}

export function read_stdin() {
  return fs.readFileSync( 0, 'utf8' );
  /*
  return new Promise( ( resolve, reject ) => {
    let data = '';
    process.stdin.setEncoding( 'utf8' );
    process.stdin.on( 'readable', () => {
      const chunk = process.stdin.read();
      if ( chunk !== null ) data += chunk;
    } );
    process.stdin.on( 'end', () => resolve( data ) );
    process.stdin.on( 'error', err => reject( err ) );
  } );
  */
}

export function read_text( filename ) {
  return fs.readFileSync( filename, 'utf8' );
}

export function read_file( filename ) {
  const res = parse_text( read_text( filename ) );
  if ( _.isArray( res ) && res.length === 1 ) return res[0];
  return res;
}

export function run_command( command ) {
  return execSync( command, {
    env       : process.env,
    encoding  : 'utf8',
  } );
}

export function parse_text( text ) {
  try {
    return JSON.parse( text );
  } catch( err1 ) {
    try {
      return YAML.safeLoadAll( text );
    } catch( err2 ) {
      console.error( 'Could not parse text as either JSON or YAML' );
      console.error( 'JSON:', err1 );
      console.error( 'YAML:', err2 );
      throw new Error( 'Unable to parse text' );
    }
  }
}

const usagefile = path.resolve( __dirname, '..', 'usage.txt' );
export function usage( error, code=0 ) {
  const out = ( error || code ) ? process.stderr : process.stdout;
  if ( error ) out.write( String( error ) + '\n' );
  out.write( fs.readFileSync( usagefile, 'utf8' ) );
  process.exit( code );
}

export function extract_opts( data, opts ) {
  return _.omitBy( _.pick( data, _.keys( opts ) ), _.isNil );
}

/**
 * Transform options into canonical formats (and names).
 */
export function transform_opts( data, opts ) {
  const env = get_environment();
  const attachers = _.compact( _.uniq( _.flattenDeep( _.map( [
    '_', 'attacher', 'attachers', 'attachment', 'attachments', 'attach',
  ], n => {
    const x = data[ n ];
    delete data[ n ];
    return x;
  } ) ) ) );
  data = _.mapValues( opts, ( conf, opt ) => {
    if ( ! _.isNil( data[ opt ] ) ) return data[ opt ];
    for ( const alias of conf.alias ) {
      if ( _.has( data, alias ) ) return data[ alias ];
    }
    if ( ! _.isNil( env[ opt ] ) ) return env[ opt ];
    for ( const alias of conf.alias ) {
      if ( _.has( env, alias ) ) return env[ alias ];
    }
    return conf.default;
  } );
  data = _.omitBy( data, _.isNil );
  data = _.omitBy( data, ( val, key ) => {
    const opt = opts[ key ];
    if ( ! opt ) return true;
    return ( val === opt.default );
  } );
  if ( ! _.isEmpty( attachers ) ) data.attachers = attachers;
  return data;
}
