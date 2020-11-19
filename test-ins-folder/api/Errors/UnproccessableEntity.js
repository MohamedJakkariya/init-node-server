const { ExtendableError } = require('./ExtendableError');

// 422 Unprocessable Entity
class UnprocessableEntity extends ExtendableError {
  constructor(m) {
    if (arguments.length === 0) super('unprocessable entity');
    else super(m);
  }
}

exports.UnprocessableEntity = UnprocessableEntity;
