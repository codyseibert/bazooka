let random = Math.random();
let count = 0;

module.exports = {
  index({ query, body, params }) {
    console.log("gg");
    return {
      random,
      count: count++
    };
  },
  index2({ query, body, params }) {
    return {
      k: "1"
    };
  }
};
