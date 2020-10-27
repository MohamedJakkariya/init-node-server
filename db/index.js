/**
 * @format
 * @params : Options
 * @type :   Object
 * @desc :   Get all data from the given tables
 * @return : Promise
 */

exports.getAllData = (options) => {
	return new Promise((resolve, reject) => {
		connection.query(
			`SELECT ${options.projection} FROM ${options.table_names}`,
			function (error, results, fields) {
				if (error) {
					console.log(error);
					return reject('Msg => ', error.sqlMessage);
				}
				resolve(results);
			},
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
exports.getData = (res, options) => {
	return new Promise((resolve, reject) => {
		connection.query(
			`SELECT ${options.projection} FROM ${options.table_name} WHERE ${options.field_name} = ?`,
			options.value,
			function (error, result, fields) {
				if (error) {
					console.log(error);
					return res.status(500).json({
						err:
							'Please try after sometime, if the problem persist then feel free to contact us',
					});
				}
				// console.log(result);
				resolve(result);
			},
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
exports.insertOne = (res, options) => {
	return new Promise((resolve, reject) => {
		connection.query(
			`INSERT INTO ${options.table_name} SET ?`,
			options.post,
			function (err, results, fields) {
				if (err) {
					console.log(err);
					return res.status(500).json({
						err:
							'Please try after sometime, if the problem persist then feel free to contact us',
					});
				}
				resolve(results);
			},
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
exports.deleteOne = (res, options) => {
	return new Promise((resolve, reject) => {
		connection.query(
			`DELETE FROM ${options.table_name} WHERE ${options.condition}`,
			options.value,
			(err, result, fields) => {
				console.log(err);
				if (err) {
					console.log(err);
					return res.status(500).json({
						err:
							'Please try after sometime, if the problem persist then feel free to contact us',
					});
				}
				console.log(result);
				resolve(result);
			},
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
exports.getDataFromMultipleTable = (res, options) => {
	return new Promise((resolve, reject) => {
		connection.query(
			`select ${options.projection}  from ${options.table_names} where ${options.condition} 
    `,
			options.value,
			(err, results, fields) => {
				if (err) {
					console.log(err);
					return res.status(500).json({
						err:
							'Please try after sometime, if the problem persist then feel free to contact us',
					});
				}
				resolve(results);
			},
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
exports.updateOne = (res, options) => {
	return new Promise((resolve, reject) => {
		// console.log(options);

		connection.query(
			`UPDATE ${options.table_name} SET ${options.updating_fields} WHERE ${options.key} = ?`,
			[...options.updating_values, options.value],
			(err, results, fields) => {
				if (err) {
					console.log(err);
					return res.status(500).json({
						err:
							'Please try after sometime, if the problem persist then feel free to contact us',
					});
				}
				console.log(results);
				resolve(results);
			},
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
exports.foreignKeyMode = (mode) => {
	return new Promise((resolve, reject) => {
		// console.log(options);

		connection.query(
			`SET FOREIGN_KEY_CHECKS = ?`,
			mode,
			(err, results, fields) => {
				if (err) {
					console.log(err);
					return res.status(500).json({
						err:
							'Please try after sometime, if the problem persist then feel free to contact us',
					});
				}
				console.log(
					mode === 0 ? 'Foreign key Disabled' : 'Foreign key Enabled',
				);
				resolve(true);
			},
		);
	});
};
