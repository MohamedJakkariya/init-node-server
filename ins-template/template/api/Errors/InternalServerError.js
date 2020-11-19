const { ExtendableError } = require('./ExtendableError');

// 500 Internal Server Error
class InternalServerError extends ExtendableError {
  constructor(m) {
    if (arguments.length === 0) super('internal server error');
    else super(m);
  }
}

exports.InternalServerError = InternalServerError;
