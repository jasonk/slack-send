import path from 'path';

describe( 'examples', () => {

  xit( 'comic-book-alert', () => {
    example( 'comic-book-alert', msg => {
      msg.should.have.property( 'text', '' );
      msg.should.have.property( 'username', 'ComicBookGuy' );
      console.log( 'MSG', msg );
    } );
  } );

} );
