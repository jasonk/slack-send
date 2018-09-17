describe( 'SlackSend', () => {

  it( 'should correctly handle text', () => {
    const msg = payload( { text : 'foo' } );
    msg.should.have.property( 'text', 'foo' );
  } );
  it( 'should correctly extract a text-only attachment', () => {
    const msg = payload( { attachments : [ { text : 'attach-1' } ] } );
    msg.should.have.property( 'text', 'attach-1' );
  } );

} );
