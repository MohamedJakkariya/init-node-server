const { ExtendableError } = require('./ExtendableError');

// 400 Bad Request
class BadRequest extends ExtendableError {
  constructor(m) {
    if (arguments.length === 0) super('bad request');
    else super(m);
  }
}

exports.BadRequest = BadRequest;
