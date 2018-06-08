import _ from 'lodash';
import { Attachment, Options } from './';
import request from 'request';
import { gravatar_url, extract_opts } from './utils';
import { expand } from './attachers';

const debug = require( 'debug' )( 'slack-send:message' );

const transforms = {
  thread_ts( val ) {
    if ( /^\d+\.\d+$/.test( val ) ) return val;
    throw new Error( `Invalid thread_ts` );
  },
  icon_emoji( val ) { return ':' + val.replace( /(^:+|:+$)/g, '' ) + ':'; },
};

export default class Message {

  constructor( options ) {
    _.assign( this, extract_opts( options, Message.options ) );
    this.attachments = [];
    this.attach( extract_opts( options, Attachment.options ) );
    _.each( options.attachers, att => this.attach( att ) );
  }

  attach( ...args ) {
    _.each( args, opt => {
      opt = expand( opt );
      if ( _.isEmpty( opt ) ) return;
      if ( _.isArray( opt ) ) return _.map( opt, o => this.attach( o ) );
      this.attachments.push( new Attachment( opt ) );
    } );
  }

  send( cb ) {
    const payload = this.getPayload();
    if ( debug.enabled ) debug( JSON.stringify( payload, null, 2 ) );
    if ( ! cb ) {
      cb = ( err, res, body ) => {
        if ( err ) {
          console.error( err );
          process.exit( 1 );
        } else if ( body.ok && body.ts ) {
          console.log( body.ts );
          process.exit( 0 );
        } else {
          console.error( body );
          process.exit( 1 );
        }
      };
    }
    if ( ! _.isFunction( cb ) ) {
      throw new Error( `Argument to send is not a function` );
    }
    request( {
      uri       : 'https://slack.com/api/chat.postMessage',
      method    : 'POST',
      json      : true,
      headers   : { 'Content-Type' : 'application/json; charset=utf-8' },
      body      : payload,
      auth      : { bearer : this.token },
    }, cb );
  }

  getPayload() {
    const props = _.pick( this, [
      'channel',
      'username', 'icon_emoji', 'icon_url', 'as_user', 'link_names',
      'mrkdwn', 'parse', 'unfurl_links', 'unfurl_media',
      'reply_broadcast', 'thread_ts', 'pin_message',
    ] );
    props.attachments = _.map( this.attachments, a => a.getPayload() );
    const payload = _.mapValues( props, ( val, key ) => {
      const xfrm = transforms[ key ];
      if ( ! xfrm ) return val;
      return xfrm.call( this, val );
    } );
    return _.omitBy( payload, _.isNil );
  }

}

Message.options = {
  // Delivery Options
  channel         : {
    type      : 'string',
    describe  : 'Channel to send to',
    group     : 'Delivery Options',
  },
  reply_broadcast : {
    type      : 'boolean',
    implies   : 'thread_ts',
    describe  : 'Send thread response to channel',
    alias     : [ 'broadcast' ],
    group     : 'Delivery Options',
    default   : false,
  },
  thread_ts       : {
    type      : 'string',
    describe  : 'Thread to reply to',
    alias     : [ 'thread' ],
    group     : 'Delivery Options',
  },
  pin_message       : {
    type      : 'boolean',
    describe  : 'Pin message after posting it',
    group     : 'Delivery Options',
    alias     : [ 'pin' ],
    default   : false,
  },
  // Sender Options
  username        : {
    type      : 'string',
    describe  : 'Username to use as sender',
    group     : 'Sender Options',
  },
  icon_emoji      : {
    type      : 'string',
    describe  : 'Emoji id use as sender icon (i.e. :bowtie:)',
    group     : 'Sender Options',
  },
  icon_url        : {
    type      : 'string',
    describe  : 'URL to image to use as sender icon',
    group     : 'Sender Options',
  },
  as_user         : {
    type      : 'boolean',
    describe  : 'Send message as user instead of bot',
    group     : 'Sender Options',
    default   : false,
    hidden    : true,
  },
  // Configuration Options
  link_names      : {
    type      : 'boolean',
    describe  : 'Find and link channel names and usernames',
    group     : 'Configuration Options',
    default   : false,
    hidden    : true,
  },
  mrkdwn         : {
    type      : 'boolean',
    describe  : 'Enable slack markup parsing?',
    group     : 'Configuration Options',
    default   : false,
    hidden    : true,
  },
  parse           : {
    type      : 'string',
    describe  : 'Message parsing type',
    options   : [ 'none', 'full' ],
    group     : 'Configuration Options',
    hidden    : true,
  },
  unfurl_links    : {
    type      : 'boolean',
    describe  : 'Automatically unfurl links',
    group     : 'Configuration Options',
    default   : false,
    hidden    : true,
  },
  unfurl_media    : {
    type      : 'boolean',
    describe  : 'Automatically unfurl media',
    group     : 'Configuration Options',
    default   : false,
    hidden    : true,
  },
  fallback_template : {
    type      : 'string',
    describe  : 'Template for automatically building fallback text',
    default   : '{pretext} - {title} <{title_link}>',
    group     : 'Configuration Options',
    hidden    : true,
  },
  token     : {
    type      : 'string',
    describe  : 'Slack Authentication Token',
    group     : 'Configuration Options',
    defaultDescription  : '$SLACK_SEND_TOKEN or $SLACK_TOKEN',
  },
};
