const mysql = require('mysql2/promise');
const pool = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_DATABASE,
	port: process.env.DB_PORT,
	waitForConnections: true,
	connectionLimit: 10
});

// mode = 'I', 'U', 'S', 'D'
// table = 'tableName'
// field = ['title', 'writer', 'content']
// data = {title: 'A', content: 'B'} // req.body
// file = {filename: '201113-.jpg', originalname: 'abc.jpg', size: 1234} // req.file
// key = id값
const sqlGen = (obj) => {
	let { mode, table, field, data, file, key } = obj;
	const sql = 'INSERT INTO table SET title=?, writer=?'
	// const sql = 'UPDATE table SET '
	return { sql, values }
}

module.exports = { mysql, pool };