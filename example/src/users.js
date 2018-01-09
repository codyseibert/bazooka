module.exports = {
  index(request) {
    return Promise.resolve({
      testing: 1,
      name: 'cody',
      lastname: 'seibert'
    });
  }
}