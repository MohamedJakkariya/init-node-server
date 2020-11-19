const { ExtendableError } = require('./ExtendableError');

// 404 Not Found
class NotFound extends ExtendableError {
  constructor(m) {
    if (arguments.length === 0) super('not found');
    else super(m);
  }
}

exports.NotFound = NotFound;
