console.time('cp');
var cp = require('child_process');
console.timeEnd('cp');

console.time('first');
cp.execSync('node ./count.js');
console.timeEnd('first');

console.time('second');
cp.execSync('node ./count.js');
console.timeEnd('second');

console.time('third');
cp.execSync('node ./count.js');
console.timeEnd('third');
