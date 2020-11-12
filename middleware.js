/** node_modules ********************************/
require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const createError = require('http-errors');

app.listen(process.env.PORT, () => {
	console.log( `http://127.0.0.1:${process.env.PORT}` );
});

const first = (req, res, next) => {
	console.log('FIRST');
	next();
}

const third = (value) => {
	return (req, res, next) => {
		console.log(value);
		next();
	}
}

app.get('/', third('THIRD'), (req, res, next) => {
	console.log('SECOND');
	res.send('<h1>Hello</h1>');
});