let random = Math.random();
let count = 0;

module.exports = {
  index({query, body, params}) {
    return {
      random,
      count: count++,
    };
  },
}