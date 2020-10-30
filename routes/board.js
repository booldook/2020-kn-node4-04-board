const express = require('express');
const router = express.Router();

router.get(['/', '/list'], (req, res, next) => {
	const pug = {title: '게시판 리스트'}
	res.render('./board/list.pug', pug);
});

module.exports = router;