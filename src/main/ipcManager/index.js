
/**
 * Listen event from  Renderer Process
 */

import fs from 'fs';

fs.readdirSync(__dirname).filter((value) => {
  return value !== 'index.js';
}).map(value => require('./' + value));
