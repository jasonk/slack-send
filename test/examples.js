import path from 'path';

describe( 'examples', () => {

  it( 'comic-book-alert', () => {
    example( 'comic-book-alert', msg => {
      msg.should.have.property( 'text', 'New comic book alert!' );
      msg.should.have.property( 'username', 'ComicBookGuy' );
    } );
  } );

} );
