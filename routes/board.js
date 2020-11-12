const express = require('express');
const moment = require('moment');
const path = require('path');
const fs = require('fs-extra');
const createError = require('http-errors');
const router = express.Router();
const { pool } = require('../modules/mysql-conn');
const { alert, uploadFolder } = require('../modules/util');
const { upload, imgExt } = require('../modules/multer-conn');
const { connect } = require('http2');

router.get(['/', '/list'], async (req, res, next) => {
	let connect, rs, sql, values, pug;
	pug = {title: '게시판 리스트', js: 'board', css: 'board'};
	try {
		sql = 'SELECT * FROM board ORDER BY id DESC';
		connect = await pool.getConnection();
		rs = await connect.query(sql);
		connect.release();
		pug.lists = rs[0];
		pug.lists.forEach((v) => {
			v.wdate = moment(v.wdate).format('YYYY년 MM월 DD일');
		});
		res.render('./board/list.pug', pug);
	}
	catch(e) {
		if(connect) connect.release();
		next(createError(500, e.sqlMessage));
	}
});

router.get('/write', (req, res, next) => {
	const pug = {title: '게시글 작성', js: 'board', css: 'board'};
	res.render('./board/write.pug', pug);
});

router.post('/save', upload.single('upfile'), async (req, res, next) => {
	let connect, rs, sql, values, pug;
	let { title, content, writer } = req.body;

	try {
		values = [title, writer, content];
		sql = 'INSERT INTO board SET title=?, writer=?, content=?';
		if(req.allowUpload) {
			if(req.allowUpload.allow) {
				sql += ', savefile=?, realfile=?';
				values.push(req.file.filename);
				values.push(req.file.originalname);
			}
			else {
				res.send(alert(`${req.allowUpload.ext}은(는) 업로드 할 수 없습니다.`, '/board'));
			}
		}
		connect = await pool.getConnection();
		rs = await connect.query(sql, values);
		connect.release();
		res.redirect('/board');
	}
	catch(e) {
		if(connect) connect.release();
		next(createError(500, e.sqlMessage));
	}
});

router.get('/view/:id', async (req, res) => {
	let connect, rs, sql, values, pug;
	try {
		pug = {title: '게시글 보기', js: 'board', css: 'board'};
		sql = "SELECT * FROM board WHERE id=?";
		values = [req.params.id];
		connect = await pool.getConnection();
		rs = await connect.query(sql, values);
		connect.release();
		pug.list = rs[0][0];
		pug.list.wdate = moment(pug.list.wdate).format('YYYY-MM-DD HH:mm:ss');
		if(pug.list.savefile) {
			var ext = path.extname(pug.list.savefile).toLowerCase().replace(".", "");
			if(imgExt.indexOf(ext) > -1) {
				pug.list.imgSrc = `/storage/${pug.list.savefile.substr(0, 6)}/${pug.list.savefile}`;
			}
		}
		res.render('./board/view.pug', pug);
	}
	catch(e) {
		if(connect) connect.release();
		next(createError(500, e.sqlMessage));
	}
});

router.get('/delete/:id', async (req, res, next) => {
	let connect, rs, sql, values, pug;
	try {
		sql = "DELETE FROM board WHERE id=?";
		values = [req.params.id];
		connect = await pool.getConnection();
		rs = await connect.query(sql, values);
		connect.release();
		res.send(alert('삭제되었습니다', '/board'));
	}
	catch(e) {
		if(connect) connect.release();
		next(createError(500, e.sqlMessage));
	}
});

router.get('/update/:id', async (req, res, next) => {
	let connect, rs, sql, values, pug;
	try {
		pug = {title: '게시글 수정', js: 'board', css: 'board'};
		sql = "SELECT * FROM board WHERE id=?";
		values = [req.params.id];
		connect = await pool.getConnection();
		rs = await connect.query(sql, values);
		connect.release();
		pug.list = rs[0][0];
		res.render('./board/write.pug', pug);
	}
	catch(e) {
		if(connect) connect.release();
		next(createError(500, e.sqlMessage));
	}
});

router.post('/saveUpdate', upload.single('upfile'), async (req, res, next) => {
	let connect, rs, sql, sqlRoot, values, pug;
	let { id, title, writer, content } = req.body;
	try {
		sqlRoot = 'UPDATE board SET title=?, writer=?, content=?';
		values = [title, writer, content];
		if(req.allowUpload) {
			if(req.allowUpload.allow) {
				sql = 'SELECT savefile FROM board WHERE id='+id;
				connect = await pool.getConnection();
				rs = await connect.query(sql);
				if(rs[0][0].savefile) fs.removeSync(uploadFolder(rs[0][0].savefile));
				sqlRoot += ', savefile=?, realfile=?';
				values.push(req.file.filename);
				values.push(req.file.originalname);
			}
			else {
				res.send(alert(`${req.allowUpload.ext}은(는) 업로드 할 수 없습니다.`, '/board'));
			}
		}
		sqlRoot += ' WHERE id='+id;
		connect = await pool.getConnection();
		rs = await connect.query(sqlRoot, values);
		connect.release();
		if(rs[0].affectedRows == 1) res.send(alert('수정되었습니다', '/board'));
		else res.send(alert('수정에 실패하였습니다.', '/board'));
	}
	catch(e) {
		if(connect) connect.release();
		next(createError(500, e.sqlMessage));
	}
});

router.get('/download', (req, res, next) => {
	let { file: saveFile, name: realFile } = req.query;
	res.download(uploadFolder(saveFile), realFile);
});

router.get('/fileRemove/:id', async (req, res, next) => {
	let connect, rs, sql, values, list, pug;
	try {
		sql = 'SELECT * FROM board WHERE id='+req.params.id;
		connect = await pool.getConnection();
		rs = await connect.query(sql);
		connect.release();
		list = rs[0][0];
		if(list.savefile) {
			try {
				fs.removeSync(uploadFolder(list.savefile));
				sql = 'UPDATE board SET savefile=NULL, realfile=NULL';
				connect = await pool.getConnection();
				rs = await connect.query(sql);
				connect.release();
				res.json({code: 200});
			}
			catch(e) {
				res.json({code: 500, err: e});
			}
		}
	}
	catch(e) {
		if(connect) connect.release();
		next(createError(500, e.sqlMessage));
	}
});

module.exports = router;