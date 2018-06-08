import SlackSend from '../src';

describe( 'tokens', () => {

  it( 'should find a token from the environment', () => {
    const token = 'some-fake-token';
    process.env.SLACK_SEND_TOKEN = token;
    const msg = SlackSend( {} );
    delete process.env.SLACK_SEND_TOKEN;
    msg.should.have.property( 'token', token );
  } );
  it( 'should find a token from SLACK_TOKEN', () => {
    const token = 'some-fake-token';
    process.env.SLACK_TOKEN = token;
    const msg = SlackSend( {} );
    delete process.env.SLACK_TOKEN;
    msg.should.have.property( 'token', token );
  } );

} );
