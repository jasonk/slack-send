import _ from 'lodash';

import { Attachers, Options } from './';
import { gravatar_url, translate_color, extract_opts } from './utils';

const debug = require( 'debug' )( 'slack-send:attachment' );

class Field {
  constructor( title, value, short=false ) {
    _.assign( this, { title, value, short } );
  }
  getPayload() {
    const payload = _.pick( this, [ 'title', 'value', 'short' ] );
    return _.omitBy( payload, _.isNil );
  }
}

/*
 * For action buttons that are attached to an app the attachment must
 * include: attachment_type/callback_id.  For these buttons the
 * properties of the action are: name/text/type/value.
 *
 * For simple link buttons, the action properties are:
 * type/text/url/style.
 *
 * Style can be omitted for a default button, or 'primary' or 'danger'
 */
class Action {
  constructor( opts ) {
    _.assign( this, opts );
    _.defaults( this, {
      type      : 'button',
    } );
  }
  getPayload() {
    const payload = _.pick( this, [
      'type', 'text', 'url', 'style', 'name', 'value',
    ] );
    return _.omitBy( payload, _.isNil );
  }
}

const transforms = {
  author_icon( val ) { return gravatar_url( val ); },
  text( val ) { return _.isArray( val ) ? val.join( ' ' ) : val; },
  color( val ) { return translate_color( val, this.color_map ); },
};

export default class Attachment {

  constructor( options ) {
    const {
      action, short_field, long_field, ...opts
    } = extract_opts( options, Attachment.options );
    debug( 'attachment options', options );
    _.assign( this, opts );
    this.fields = [];
    this.actions = [];
    this.long_field( long_field );
    this.short_field( short_field );
    this.action( action );
  }

  getPayload() {
    // field short_field
    const props = _.pick( this, [
      'color', 'pretext', 'fallback', 'text', 'ts',
      'author_name', 'author_link', 'author_icon',
      'title', 'title_link', 'image_url', 'thumb_url',
      'footer', 'footer_icon',
    ] );
    const fields = this.fields.map( f => f.getPayload() );
    if ( ! _.isEmpty( fields ) ) props.fields = fields;
    const actions = this.actions.map( a => a.getPayload() );
    if ( ! _.isEmpty( actions ) ) props.actions = actions;
    const payload = _.mapValues( props, ( val, key ) => {
      const xfrm = transforms[ key ];
      if ( ! xfrm ) return val;
      return xfrm.call( this, val );
    } );
    return _.omitBy( payload, _.isNil );
  }

  action( opts ) {
    if ( _.isNil( opts ) ) return;
    if ( _.isArray( opts ) ) return _.map( opts, o => this.action( o ) );
    this.actions.push( new Action( opts ) );
  }

  field( name, value, short=false ) {
    if ( _.isNil( name ) ) return;
    if ( _.isArray( name ) ) {
      return _.map( name, f => this.field( f, null, short ) );
    }
    if ( _.isObject( name ) && _.has( name, 'value' ) ) {
      return this.field( name.title || name.name, name.value, name.short );
    }
    if ( _.isObject( name ) ) {
      return _.map( name, ( val, key ) => this.field( key, val, short ) );
    }
    if ( _.isNil( value ) ) {
      const x = /^([^=]+)\s*=\s*(.*)$/.exec( name );
      if ( ! x ) return;
      name = x[1]; value = x[2];
    }
    const f = new Field( name, value, short );
    this.fields.push( f );
    return f;
  }
  short_field( name, value ) { return this.field( name, value, true ); }
  long_field( name, value ) { return this.field( name, value, false ); }

  get fallback() {
    if ( this._fallback ) return this._fallback;
    const tmpl = this.fallback_template;
    if ( ! tmpl ) return;
    const rep = ( match, field ) => opts[ field ] || '';
    return this.fallback_template.replace( /\{([\w\-]+)\}/g, rep );
  }
  set fallback( f ) { this._fallback = f; }

  get fallback_with_separate_urls() {
    const urls = [];
    let i = 0;
    const rep = ( match, url, text ) => {
      i++;
      urls.push( `[${i}]${url}` );
      return `${text}[${i}]`;
    };
    let msg = this.fallback.replace( /<(https?:\/\/.*?)\|(.*?)>/g, rep );
    msg += ' - ' + urls.join( ' ' );
    return msg;
  }
}

Attachment.options = {
  long_field  : {
    type      : 'string',
    array     : true,
    describe  : 'Add a field to the message',
    alias     : [ 'field', 'long_fields', 'fields' ],
    hidden    : true,
  },
  short_field : {
    type      : 'string',
    array     : true,
    describe  : 'Add a short field to the message',
    alias     : [ 'short_fields' ],
    hidden    : true,
  },
  action    : {
    type      : 'string',
    describe  : 'Action configuration',
    array     : true,
    alias     : [ 'actions' ],
    hidden    : true,
  },
  color     : {
    type      : 'string',
    describe  : 'Message color',
  },
  color_map : {
    type      : 'string',
    describe  : 'Color map for mapping color names',
    array     : true,
    normalize : true,
    hidden    : true,
  },
  pretext   : {
    type      : 'string',
    describe  : 'Text that appears above the message block',
  },
  fallback  : {
    type      : 'string',
    describe  : 'Fallback message for clients without formatting',
  },
  author_name   : {
    type      : 'string',
    describe  : 'Author name',
  },
  author_link   : {
    type      : 'string',
    describe  : 'Author link URL',
  },
  author_icon   : {
    type      : 'string',
    describe  : 'Author icon URL (or use email address for Gravatar)',
  },
  title         : {
    type      : 'string',
    describe  : 'Message title',
  },
  title_link    : {
    type      : 'string',
    describe  : 'Message title link',
  },
  text          : {
    type      : 'string',
    describe  : 'Main message text, can contain standard message markup',
  },
  image_url     : {
    type      : 'string',
    describe  : 'Image URL (up to 400px wide or 500px high)',
  },
  thumb_url     : {
    type      : 'string',
    describe  : 'Thumbnail URL (up to 75px wide or high)',
  },
  footer        : {
    type      : 'string',
    describe  : 'Footer text (up to 300 characters)',
  },
  footer_icon   : {
    type      : 'string',
    describe  : 'Footer text (up to 300 characters)',
  },
  ts            : {
    type      : 'string',
    describe  : 'Timestamp of event',
  },
  attachment_type : {
    type      : 'string',
    describe  : 'Type of attachment',
    options   : [ 'default' ],
    group     : 'Advanced Options',
    hidden    : true,
  },
  callback_id     : {
    type      : 'string',
    describe  : 'Callback ID',
    options   : [ 'default' ],
    group     : 'Advanced Options',
    hidden    : true,
  },
};
