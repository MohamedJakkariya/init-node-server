const { ExtendableError } = require('./ExtendableError');

// 403 Forbidden
class Forbidden extends ExtendableError {
  constructor(m) {
    if (arguments.length === 0) super('forbidden');
    else super(m);
  }
}

exports.Forbidden = Forbidden;
