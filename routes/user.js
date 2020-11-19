const express = require('express');
const router = express.Router();

router.get('/join', (req, res, next) => {
	const pug = {title: '회원 가입', js: 'user-fr', css: 'user-fr'}
	res.render('user/join', pug);
});

module.exports = router;