describe( 'SlackSend', () => {

  it( 'should correctly handle text', () => {
    const msg =  payload( { text : 'foo' } );
    msg.should.have.nested.property( 'attachments[0].text', 'foo' );
  } );
  it( 'should build correctly with attachment arguments at top', () => {
    const msg = payload( { text : 'attach-1' } );
    msg.should.have.nested.property( 'attachments[0].text', 'attach-1' );
  } );
  it( 'should build correctly with attachment arguments at end', () => {
    const msg = payload( { attach : [ { text : 'attach-2' } ] } );
    msg.should.have.nested.property( 'attachments[0].text', 'attach-2' );
  } );

} );
