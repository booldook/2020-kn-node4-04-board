const express = require('express');
const router = express.Router();
const createError = require('http-errors');
const bcrypt = require('bcrypt');
const { sqlGen } = require('../modules/mysql-conn');
const { alert } = require('../modules/util');

router.get('/join', (req, res, next) => {
	const pug = {title: '회원 가입', js: 'user-fr', css: 'user-fr'}
	res.render('user/join', pug);
});


router.get('/idchk/:userid', async (req, res, next) => {
	try {
		let rs = await sqlGen('users', 'S', {
			field:['userid'],
			where: ['userid', req.params.userid]
		});
		// rs[0] => [], rs[0] => [{userid: 'booldook'}]
		if(rs[0].length > 0) res.json({code: 200, isUsed: false});
		else res.json({code: 200, isUsed: true});
	}
	catch(e) {
		res.json({ code: 500, error: e.sqlMessage || e});
	}
});

router.post('/save', async (req, res, next) => {
	console.log(process.env.BCRYPT_SALT, process.env.BCRYPT_ROUND);
	req.body.userpw = await bcrypt.hash(
		req.body.userpw + process.env.BCRYPT_SALT, Number(process.env.BCRYPT_ROUND));
	try {
		let rs = await sqlGen('users', 'I', {
			field: ['userid', 'userpw', 'username'],
			data: req.body
		});
		if(rs[0].affectedRows == 1) {
			res.send(alert('회원가입이 완료되었습니다. 로그인 해 주세요.', '/user/login'));
		}
		else {
			res.send(alert('회원가입이 실패. 다시시도.', '/user/join'));
		}
	}
	catch(e) {
		next(createError(500, e.sqlMessage || e));
	}
});

module.exports = router;