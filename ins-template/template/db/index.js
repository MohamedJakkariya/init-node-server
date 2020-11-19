const Logger = require('js-logger');
/**
 * @format
 * @params : Options
 * @type :   Object
 * @desc :   Get all data from the given tables
 * @return : Promise
 */
exports.poolConnect = pool => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) return reject(err); // not connected!

      return resolve(connection);
    });
  });
};

/**
 * @params : Options<object>
 * @return : <Promise>
 * @desc :   Get all data from the given tables
 */
exports.getAll = (connection, options) => {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT ${options.projection} FROM ${options.table_names}`, (err, results) => {
      if (err) return reject(err);

      return resolve(results);
    });
  });
};

/**
 * @params : Options<Object>
 * @return : <Promise>
 * @desc :   Get all data from the given tables
 */
exports.getOne = (connection, options) => {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT ${options.projection} FROM ${options.table_name} WHERE ${options.condition}`,
      options.value,
      (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      }
    );
  });
};

/**
 * @params : Options<Object>
 * @return : <Promise>
 * @desc :   Get all data from the given tables
 */
exports.insertOne = (connection, options) => {
  return new Promise((resolve, reject) => {
    connection.query(`INSERT INTO ${options.table_name} SET ?`, options.data, (err, results) => {
      if (err) return reject(err);

      Logger.log(`Inserted id ${results.insertId}!`);
      return resolve(results);
    });
  });
};

/**
 * @params : Options<Object>
 * @return : <Promise>
 * @desc :   Get all data from the given tables
 */
exports.deleteOne = (connection, options) => {
  return new Promise((resolve, reject) => {
    connection.query(`DELETE FROM ${options.table_name} WHERE ${options.condition}`, options.value, (err, result) => {
      if (err) return reject(err);

      Logger.log('Deleted successfully!');
      return resolve(result);
    });
  });
};

/**
 * @params : Options<Object>
 * @return : <Promise>
 * @desc :   Get all data from the given tables
 */
exports.getMulti = (connection, options) => {
  return new Promise((resolve, reject) => {
    connection.query(
      `select ${options.projection}  from ${options.table_names} where ${options.conditions} 
    `,
      options.value,
      (err, results) => {
        if (err) return reject(err);

        return resolve(results);
      }
    );
  });
};

/**
 * @params : Options<Object>
 * @return : <Promise>
 * @desc :   Get all data from the given tables
 */
exports.updateOne = (connection, options) => {
  return new Promise((resolve, reject) => {
    connection.query(
      `UPDATE ${options.table_name} SET ${options.updating_fields} WHERE ${options.key} = ?`,
      [...options.updating_values, options.value],
      (err, results) => {
        if (err) return reject(err);

        Logger.log(`Updated successfully - affected rows - ${results.affectedRows}`);
        return resolve(results);
      }
    );
  });
};

/**
 * @params : Options<Object>
 * @return : <Promise>
 * @desc :   Get all data from the given tables
 */
exports.foreignKeyMode = (connection, mode) => {
  return new Promise((resolve, reject) => {
    connection.query(`SET FOREIGN_KEY_CHECKS = ?`, mode, err => {
      if (err) return reject(err);

      Logger.info(mode === 0 ? 'Foreign key Disabled' : 'Foreign key Enabled');
      return resolve(true);
    });
  });
};

/**
 * @params : err<string>
 * @return : Error<stack>
 * @desc :   Return err depends on call back
 */
exports.rollback = (connection, err) =>
  connection.rollback(() => {
    throw err;
  });

/**
 * @desc :   Complete the transaction
 * @return : boolean or err stack
 */
exports.commit = connection => {
  connection.commit(err => {
    if (err)
      return connection.rollback(() => {
        throw err;
      });

    Logger.info('Transaction complete!');
    return true;
  });
};

/**
 * @params : Options<Object>
 * @return : <Promise>
 * @desc :   Insert data into multiple tables
 */
exports.insertIntoMultiTables = (connection, options) => {
  return new Promise((resolve, reject) => {
    const baseQ = `INSERT INTO ? SET ? ; `;

    let genQ = baseQ.repeat(options.length);

    const data = [];

    // make our query with data array
    options.forEach(v => {
      genQ = genQ.replace('INSERT INTO ?', `INSERT INTO ${v.table_name}`);
      data.push(v.data);
    });

    // Make an multiple query at a time
    connection.query(`${genQ}`, data, (err, results) => {
      if (err) return reject(err);

      Logger.log(`Inserted id ${results.insertId}!`);
      return resolve(results);
    });
  });
};

/**
 * @params : Options<Object>
 * @return : <Promise>
 * @desc :   Insert multiple data into same tables
 */
exports.insertIntoMultiData = (connection, options) => {
  return new Promise((resolve, reject) => {
    const baseQ = `INSERT INTO SET ? ; `;

    let genQ = baseQ.repeat(options.data.length);

    // genQ = replaceAll(genQ, 'INSERT INTO ?', `INSERT INTO ${options.table_name}`);
    genQ = genQ.replace(/INSERT INTO/g, `INSERT INTO ${options.table_name}`);
    // Make an multiple query at a time
    connection.query(`${genQ}`, options.data, (err, results) => {
      if (err) return reject(err);

      results.forEach(i => Logger.log(`Inserted id ${i.insertId}!`));
      return resolve(results);
    });
  });
};
