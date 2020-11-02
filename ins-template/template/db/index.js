/**
 * @format
 * @params : Options
 * @type :   Object
 * @desc :   Get all data from the given tables
 * @return : Promise
 */

const Logger = require('js-logger');

const { connection } = global;

exports.getAll = async options => {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT ${options.projection} FROM ${options.table_names}`, (err, results) => {
      if (err) {
        return reject(new Error(err.sqlMessage));
      }
      return resolve(results);
    });
  });
};

/**
 * @format
 * @params : Options
 * @type :   Object
 * @desc :   Get all data from the given tables
 * @return : Promise
 */
exports.getOne = options => {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT ${options.projection} FROM ${options.table_name} WHERE ${options.condition}`,
      options.value,
      (err, result) => {
        if (err) return reject(new Error(err.sqlMessage));
        return resolve(result);
      }
    );
  });
};

/**
 * @format
 * @params : Options
 * @type :   Object
 * @desc :   Get all data from the given tables
 * @return : Promise
 */
exports.insertOne = options => {
  return new Promise((resolve, reject) => {
    connection.query(`INSERT INTO ${options.table_name} SET ?`, options.data, (err, results) => {
      if (err) return reject(new Error(err.sqlMessage));

      Logger.log(`Inserted id ${results.insertId}!`);
      return resolve(results);
    });
  });
};

/**
 * @format
 * @params : Options
 * @type :   Object
 * @desc :   Get all data from the given tables
 * @return : Promise
 */
exports.deleteOne = options => {
  return new Promise((resolve, reject) => {
    connection.query(`DELETE FROM ${options.table_name} WHERE ${options.condition}`, options.value, (err, result) => {
      Logger.error(err);
      if (err) return reject(new Error(err.sqlMessage));

      Logger.log('Deleted successfully!');
      return resolve(result);
    });
  });
};

/**
 * @format
 * @params : Options
 * @type :   Object
 * @desc :   Get all data from the given tables
 * @return : Promise
 */
exports.getMulti = options => {
  return new Promise((resolve, reject) => {
    connection.query(
      `select ${options.projection}  from ${options.table_names} where ${options.conditions} 
    `,
      options.value,
      (err, results) => {
        if (err) return reject(new Error(err.sqlMessage));

        return resolve(results);
      }
    );
  });
};

/**
 * @format
 * @params : Options
 * @type :   Object
 * @desc :   Get all data from the given tables
 * @return : Promise
 */
exports.updateOne = options => {
  return new Promise((resolve, reject) => {
    connection.query(
      `UPDATE ${options.table_name} SET ${options.updating_fields} WHERE ${options.key} = ?`,
      [...options.updating_values, options.value],
      (err, results) => {
        if (err) return reject(new Error(err.sqlMessage));

        Logger.log('Updated successfully ...');
        return resolve(results);
      }
    );
  });
};

/**
 * @format
 * @params : Options
 * @type :   Object
 * @desc :   Get all data from the given tables
 * @return : Promise
 */
exports.foreignKeyMode = mode => {
  return new Promise((resolve, reject) => {
    connection.query(`SET FOREIGN_KEY_CHECKS = ?`, mode, err => {
      if (err) return reject(new Error(err.sqlMessage));

      Logger.info(mode === 0 ? 'Foreign key Disabled' : 'Foreign key Enabled');
      return resolve(true);
    });
  });
};
