const express = require('express');
const router = express.Router();

router.get(['/', '/list'], (req, res, next) => {
	const pug = {title: '게시판 리스트', js: 'board', css: 'board'};
	res.render('./board/list.pug', pug);
});

router.get('/write', (req, res, next) => {
	const pug = {title: '게시글 작성', js: 'board', css: 'board'};
	res.render('./board/write.pug', pug);
});

module.exports = router;