import SlackSend from '../src';

function gurl( hash ) {
  return `https://www.gravatar.com/avatar/${hash}?s=16&d=404`;
}
describe( 'gravatar', () => {

  it( 'should support author_icon gravatar', () => {
    return att_prop(
      'author_icon',
      'test@example.com',
      gurl( '55502f40dc8b7c769880b10874abc9d0' )
    );
  } );

  it( 'should add colons if left off of icon_emoji', () => {
    _.map( [
      [ ':weary:', ':weary:' ],
      [ ':confused', ':confused:' ],
      [ 'kissing', ':kissing:' ],
      [ 'sleeping:', ':sleeping:' ],
      [ ':::scream:::', ':scream:' ],
    ], ( [ input, output ] ) => top_prop( 'icon_emoji', input, output ) );
  } );

  it( 'should transform author_icon emails with gravatar', () => {
    const msg = payload( {
      attachers : [ { author_icon : 'nobody@example.com' } ],
    } );
    msg.should.have.nested.property(
      'attachments[0].author_icon',
      gurl( '8c5548eb0b2b80924f237953392df5e7' ),
    );
  } );
  it( 'should not transform author_icon non-emails', () => {
    const msg = payload( { attachments : [
      { author_icon : 'https://example.com/' },
    ] } );
    msg.should.have.nested.property(
      'attachments[0].author_icon',
      'https://example.com/',
    );
  } );

} );
