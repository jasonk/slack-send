import _ from 'lodash';

export const formatters = {};

export function register( name, fn ) {
  formatters[ name ] = fn;
}
