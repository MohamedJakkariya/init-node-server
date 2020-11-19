const { ExtendableError } = require('./ExtendableError');

// 401 Unauthorized
class Unauthorized extends ExtendableError {
  constructor(m) {
    if (arguments.length === 0) super('unauthorized');
    else super(m);
  }
}

exports.Unauthorized = Unauthorized;
