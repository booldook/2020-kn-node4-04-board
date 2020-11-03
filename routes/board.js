const express = require('express');
const moment = require('moment');
const router = express.Router();
const { pool } = require('../modules/mysql-conn');
const { alert } = require('../modules/util');

router.get(['/', '/list'], async (req, res, next) => {
	const pug = {title: '게시판 리스트', js: 'board', css: 'board'};
	try {
		const sql = 'SELECT * FROM board ORDER BY id DESC';
		const connect = await pool.getConnection();
		const rs = await connect.query(sql);
		connect.release();
		pug.lists = rs[0];
		pug.lists.forEach((v) => {
			v.wdate = moment(v.wdate).format('YYYY년 MM월 DD일');
		});
		res.render('./board/list.pug', pug);
	}
	catch(e) {
		next(e);
	}
});

router.get('/write', (req, res, next) => {
	const pug = {title: '게시글 작성', js: 'board', css: 'board'};
	res.render('./board/write.pug', pug);
});

router.post('/save', async (req, res, next) => {
	const { title, content, writer } = req.body;
	var values = [title, writer, content];
	var sql = 'INSERT INTO board SET title=?, writer=?, content=?';
	try {
		const connect = await pool.getConnection();
		const rs = await connect.query(sql, values);
		connect.release();
		res.redirect('/board');
	}
	catch(err) {
		next(err);
	}
});

router.get('/view/:id', async (req, res) => {
	try {
		const pug = {title: '게시글 보기', js: 'board', css: 'board'};
		const sql = "SELECT * FROM board WHERE id=?";
		const values = [req.params.id];
		const connect = await pool.getConnection();
		const rs = await connect.query(sql, values);
		connect.release();
		pug.list = rs[0][0];
		pug.list.wdate = moment(pug.list.wdate).format('YYYY-MM-DD HH:mm:ss');
		res.render('./board/view.pug', pug);
	}
	catch(e) {
		next(e);
	}
});

router.get('/delete/:id', async (req, res, next) => {
	try {
		const sql = "DELETE FROM board WHERE id=?";
		const values = [req.params.id];
		const connect = await pool.getConnection();
		const rs = await connect.query(sql, values);
		connect.release();
		res.send(alert('삭제되었습니다', '/board'));
	}
	catch(e) {
		next(e);
	}
});

router.get('/update/:id', async (req, res, next) => {
	try {
		const pug = {title: '게시글 수정', js: 'board', css: 'board'};
		const sql = "SELECT * FROM board WHERE id=?";
		const values = [req.params.id];
		const connect = await pool.getConnection();
		const rs = await connect.query(sql, values);
		connect.release();
		pug.list = rs[0][0];
		res.render('./board/write.pug', pug);
	}
	catch(e) {
		next(e);
	}
});

router.post('/saveUpdate', async (req, res, next) => {
	const { id, title, writer, content } = req.body;
	try {
		const sql = "UPDATE board SET title=?, writer=?, content=? WHERE id=?";
		const values = [title, writer, content, id];
		const connect = await pool.getConnection();
		const rs = await connect.query(sql, values);
		connect.release();
		if(rs[0].affectedRows == 1) res.send(alert('수정되었습니다', '/board'));
		else res.send(alert('수정에 실패하였습니다.', '/board'));
	}
	catch(e) {
		next(e);
	}
});

module.exports = router;