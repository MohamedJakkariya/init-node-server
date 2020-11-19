// SQL error function
class SqlError extends Error {
  constructor(message) {
    super(message);

    this.name = 'Sql Error';
    this.status = 500;
    this.result = false;
  }
}

exports.throwSqlError = msg => {
  throw new SqlError(msg);
};
