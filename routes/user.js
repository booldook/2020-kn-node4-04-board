const express = require('express');
const router = express.Router();
const createError = require('http-errors');
const { sqlGen } = require('../modules/mysql-conn');

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
})

module.exports = router;