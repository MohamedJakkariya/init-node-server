/** @format */

const mysql = require('mysql');
const db_config = {
	host: process.env.RDS_HOSTNAME || '',
	user: process.env.RDS_USERNAME || '',
	password: process.env.RDS_PASSWORD || '',
	port: process.env.RDS_PORT || 3000,
	database: process.env.RDS_DATABASE || '',
};
//Connect to the Amazon RDS instance
var connection = mysql.createConnection(db_config);
global.connection = connection;

const handleDbConnection = () => {
	//- Establish a new connection
	connection.connect(function (err) {
		if (err) {
			// mysqlErrorHandling(connection, err);
			console.log(
				'\n\t *** Cannot establish a connection with the database. ***',
			);

			connection = reconnect(connection);
		} else {
			console.log('\n\t *** New connection established with the database. ***');
		}
	});
};

//- Reconnection function
function reconnect(connection) {
	console.log('\n New connection tentative...');

	//- Destroy the current connection variable
	if (connection) connection.destroy();

	//- Create a new one
	connection = mysql.createConnection(db_config);
	global.connection = connection;

	connection.connect(function (err) {
		if (err) {
			console.log(' Reason of ', err.sqlMessage);
			//- Try to connect every 2 seconds.
			setTimeout(reconnect, 2000);
		} else {   
			console.log('\n\t *** New connection established with the database. ***');
			return connection;
		}
	});
}

//- Error listener
connection.on('error', function (err) {
	//- The server close the connection.
	if (err.code === 'PROTOCOL_CONNECTION_LOST') {
		console.log(
			'/!\\ Cannot establish a connection with the database. /!\\ (' +
				err.code +
				')',
		);
		connection = reconnect(connection);
	}

	//- Connection in closing
	else if (err.code === 'PROTOCOL_ENQUEUE_AFTER_QUIT') {
		console.log(
			'/!\\ Cannot establish a connection with the database. /!\\ (' +
				err.code +
				')',
		);
		connection = reconnect(connection);
	}

	//- Fatal error : connection variable must be recreated
	else if (err.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR') {
		console.log(
			'/!\\ Cannot establish a connection with the database. /!\\ (' +
				err.code +
				')',
		);
		connection = reconnect(connection);
	}

	//- Error because a connection is already being established
	else if (err.code === 'PROTOCOL_ENQUEUE_HANDSHAKE_TWICE') {
		console.log(
			'/!\\ Cannot establish a connection with the database. /!\\ (' +
				err.code +
				')',
		);
		connection = reconnect(connection);
	}
	//- Error because a connection is already being established
	else if (err.code === 'ECONNERESET') {
		console.log(
			'/!\\ Cannot establish a connection with the database. /!\\ (' +
				err.code +
				')',
		);
		connection = reconnect(connection);
	}

	//- Anything else
	else {
		console.log(
			'/!\\ Cannot establish a connection with the database. /!\\ (' +
				err.code +
				')',
		);
		connection = reconnect(connection);
	}
});

module.exports = {
	handleDbConnection,
	reconnect,
};
