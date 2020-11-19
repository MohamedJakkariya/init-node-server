class ExtendableError extends Error {
  constructor(message) {
    if (new.target === ExtendableError)
      throw new TypeError('Abstract class "ExtendableError" cannot be instantiated directly.');
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    Error.captureStackTrace(this, this.contructor);
  }
}

exports.ExtendableError = ExtendableError;
