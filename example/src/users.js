module.exports = {
  index({query, body, params}) {
    return Promise.resolve({
      testing: 1,
      name: 'cody',
      lastname: 'seibert'
    });
  },
  create({query, body, params}) {
    return Promise.resolve({
      name: 'POST',
      lastname: 'MAN'
    });
  },
  update({query, body, params}) {
    return Promise.resolve({
      name: params.id
    });
  }
}