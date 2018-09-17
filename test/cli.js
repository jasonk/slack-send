import { spawnSync } from 'child_process';

function cli( ...params ) {
  const res = spawnSync( 'debug-slack-send', params, { encoding : 'utf8' } );
  delete res.output;
  return res;
}

describe( 'Cli', () => {

  it( 'should return help when run without arguments', () => {
    const res = cli();
    res.should.have.property( 'status', 1 );
    res.should.have.property( 'stdout', '' );
    res.should.have.property( 'stderr' );
    res.stderr.should.match( /Delivery Options.*Attacher Options/ms );
  } ).slow( 6000 );
  it( 'should return help when run with --help', () => {
    const res = cli( '--help' );
    res.should.have.property( 'status', 0 );
    res.should.have.property( 'stderr', '' );
    res.should.have.property( 'stdout' );
    res.stdout.should.match( /Delivery Options.*Attacher Options/ms );
  } ).slow( 6000 );
  it( 'should return completion when run with --completion', () => {
    const res = cli( '--completion' );
    res.should.have.property( 'status', 0 );
    res.should.have.property( 'stderr', '' );
    res.should.have.property( 'stdout' );
    res.stdout.should.match( /-slack-send-completions-/ );
  } ).slow( 6000 );
  it( 'should return version when run with --version', () => {
    const res = cli( '--version' );
    res.should.have.property( 'status', 0 );
    res.should.have.property( 'stderr', '' );
    res.should.have.property( 'stdout' );
    res.stdout.should.match( /^[\d\.]+\n$/ );
  } ).slow( 6000 );

} );
