const { ExtendableError } = require('./ExtendableError');

// 409 Conflict
class Conflict extends ExtendableError {
  constructor(m) {
    if (arguments.length === 0) super('conflict');
    else super(m);
  }
}

exports.Conflict = Conflict;
