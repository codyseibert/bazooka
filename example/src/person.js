var mongoose = require('mongoose');
var randomstring = require('randomstring');
mongoose.connect('mongodb://localhost/counts', { useMongoClient: true });

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
 
var PeopleSchema = new Schema({
  name: String
});

var People = mongoose.model('People', PeopleSchema);

module.exports = {
  create({query, body, params}) {
    return new Promise((res, rej) => {
      var person = new People();
      person.name = randomstring.generate(20);
      person.save((err) => {
        res(person.toJSON());
      });
    });
  },
  index({query, body, params}) {
    return [
      1,2,3,4,5,6,7,8,9
    ]
  },
  indexa({query, body, params}) {
    return [
      1,2,3,4,5,6,7,8,9
    ]
  },
  indexb({query, body, params}) {
    return [
      1,2,3,4,5,6,7,8,9
    ]
  },
  indexc({query, body, params}) {
    return [
      1,2,3,4,5,6,7,8,9
    ]
  },
  indexd({query, body, params}) {
    return [
      1,2,3,4,5,6,7,8,9
    ]
  }
}