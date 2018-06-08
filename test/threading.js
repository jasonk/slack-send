describe( 'threading', () => {

  it( 'should pass through a valid thread_ts', () => {
    return top_prop( 'thread_ts', '1234567890.12345', '1234567890.12345' );
  } );

  xit( 'should handle thread as an alias for thread_ts', () => {
    return top_prop(
      'thread', '1234567890.12345',
      'thread_ts', '1234567890.12345'
    );
  } );

  it( 'should throw with invalid thread_ts', () => {
    const fn = () => payload( { thread_ts : 'test@example.com' } );
    fn.should.throw;
    // payload( { thread_ts : 'test@example.com' } );
  } );

  it( 'should require thread_ts if reply_broadcast is set', () => {
    const fn = () => payload( { reply_broadcast : true } );
    fn.should.throw;
  } );

  xit( 'should allow broadcast as an alias for reply_broadcast', () => {
    return top_prop( 'broadcast', true, 'reply_broadcast', true );
  } );

} );
