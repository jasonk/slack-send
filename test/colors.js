import SlackSend from '../src';

describe( 'colors', () => {

  it( 'should support colors (with mapping)', () => {
    const msg = payload( { color : 'limegreen' } );
    msg.should.have.nested.property( 'attachments[0].color', '#32cd32' );
  } );

  it( 'should support Slack\'s special colors', () => {
    _.each( [ 'good', 'warning', 'danger' ], color => {
      const msg = payload( { color } );
      msg.should.have.nested.property( 'attachments[0].color', color );
    } );
  } );

  it( 'should support colors (as hex-codes)', () => {
    const msg = payload( { color : '#32cd32' } );
    msg.should.have.nested.property( 'attachments[0].color', '#32cd32' );
  } );

} );
