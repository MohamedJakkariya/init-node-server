/**
 * @params : Options
 * @type :   Object
 * @desc :   Get all data from the given tables
 * @return : Promise
 */

exports.getAllData = async options => {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT ${options.projection} FROM ${options.table_names}`, function (error, results, fields) {
      if (error) {
        return reject({
          sql: error.sql,
          msg: error.sqlMessage
        });
      }
      resolve(results);
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
exports.getData = options => {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT ${options.projection} FROM ${options.table_name} WHERE ${options.condition} = ?`,
      options.value,
      function (error, result, fields) {
        if (error) {
          return reject({
            sql: error.sql,
            msg: error.sqlMessage
          });
        }
        // console.log(result);
        resolve(result);
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
    connection.query(`INSERT INTO ${options.table_name} SET ?`, options.data, function (err, results, fields) {
      if (err) {
        return reject({
          sql: error.sql,
          msg: error.sqlMessage
        });
      }
      console.log('Inserted successfully!');
      resolve(results);
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
    connection.query(
      `DELETE FROM ${options.table_name} WHERE ${options.condition}`,
      options.value,
      (err, result, fields) => {
        console.log(err);
        if (err) {
          return reject({
            sql: error.sql,
            msg: error.sqlMessage
          });
        }
        console.log('Deleted successfully!');
        resolve(result);
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
exports.getDataFromMultipleTable = options => {
  return new Promise((resolve, reject) => {
    connection.query(
      `select ${options.projection}  from ${options.table_names} where ${options.conditions} 
    `,
      options.value,
      (err, results, fields) => {
        if (err) {
          return reject({
            sql: error.sql,
            msg: error.sqlMessage
          });
        }
        resolve(results);
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
    // console.log(options);

    connection.query(
      `UPDATE ${options.table_name} SET ${options.updating_fields} WHERE ${options.key} = ?`,
      [...options.updating_values, options.value],
      (err, results, fields) => {
        if (err) {
          return reject({
            sql: error.sql,
            msg: error.sqlMessage
          });
        }
        console.log('Updated successfully ...');
        resolve(results);
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
    // console.log(options);

    connection.query(`SET FOREIGN_KEY_CHECKS = ?`, mode, (err, results, fields) => {
      if (err) {
        return reject({
          sql: error.sql,
          msg: error.sqlMessage
        });
      }
      console.log(mode === 0 ? 'Foreign key Disabled' : 'Foreign key Enabled');
      resolve(true);
    });
  });
};

// Options sanitization
const optionSanitization = async options => {
  const values = Object.values(options);
  console.log(values);

  const filter_value = values.map((v, i) => {
    if (v === null || v === undefined || v === '') {
      return {
        v,
        i
      };
    }
  });

  console.log(filter_value);

  if (filter_value.length > 0) {
    filter_value.forEach(value => {
      return {
        result: false,
        field: options[value.i],
        msg: `Should not be ${filter_value[value.v]}`
      };
    });
  } else {
    return {
      result: true,
      msg: 'Proper input given.'
    };
  }
};
