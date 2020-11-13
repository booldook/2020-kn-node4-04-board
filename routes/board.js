const express = require('express');
const moment = require('moment');
const path = require('path');
const fs = require('fs-extra');
const createError = require('http-errors');
const router = express.Router();
const { pool, sqlGen } = require('../modules/mysql-conn');
const { alert, uploadFolder, imgFolder, extGen } = require('../modules/util');
const { upload, imgExt } = require('../modules/multer-conn');

router.get(['/', '/list'], async (req, res, next) => {
	let connect, rs, pug;
	pug = {title: '게시판 리스트', js: 'board', css: 'board'};
	try {
		let temp = sqlGen('board', { mode: 'S', desc: 'ORDER BY id DESC' });
		connect = await pool.getConnection();
		rs = await connect.query(temp.sql);
		connect.release();
		pug.lists = rs[0];
		pug.lists.forEach((v) => {
			v.wdate = moment(v.wdate).format('YYYY년 MM월 DD일');
		});
		res.render('./board/list.pug', pug);
	}
	catch(e) {
		if(connect) connect.release();
		next(createError(500, e.sqlMessage || e));
	}
});

router.get('/write', (req, res, next) => {
	const pug = {title: '게시글 작성', js: 'board', css: 'board'};
	res.render('./board/write.pug', pug);
});

router.post('/save', upload.single('upfile'), async (req, res, next) => {
	let connect, rs;
	try {
		if(!req.allow) res.send(alert(`${req.ext}은(는) 업로드 할 수 없습니다.`, '/board'));
		else {
			let temp = sqlGen('board', {
				mode: 'I', 
				field: ['title', 'writer', 'content'], 
				data: req.body,
				file: req.file
			});
			connect = await pool.getConnection();
			rs = await connect.query(temp.sql, temp.values);
			connect.release();
			res.redirect('/board');
		}
	}
	catch(e) {
		if(connect) connect.release();
		next(createError(500, e.sqlMessage || e));
	}
});

router.get('/view/:id', async (req, res) => {
	let connect, rs, pug;
	try {
		pug = {title: '게시글 보기', js: 'board', css: 'board'};
		let temp = sqlGen('board', {mode: 'S', id: req.params.id});
		connect = await pool.getConnection();
		rs = await connect.query(temp.sql);
		connect.release();
		pug.list = rs[0][0];
		pug.list.wdate = moment(pug.list.wdate).format('YYYY-MM-DD HH:mm:ss');
		if(pug.list.savefile) {
			if(imgExt.includes(extGen(pug.list.savefile))) {
				pug.list.imgSrc = imgFolder(pug.list.savefile);
			}
		}
		res.render('./board/view.pug', pug);
	}
	catch(e) {
		if(connect) connect.release();
		next(createError(500, e.sqlMessage || e));
	}
});

router.get('/delete/:id', async (req, res, next) => {
	let connect, rs, temp;
	try {
		connect = await pool.getConnection();
		temp = sqlGen('board', {mode: 'S', id: req.params.id, field: ['savefile']});
		rs = await connect.query(temp.sql);
		if(rs[0][0].savefile) await fs.remove(uploadFolder(rs[0][0].savefile));
		temp = sqlGen('board', {mode: 'D', id: req.params.id});
		rs = await connect.query(temp.sql);
		connect.release();
		res.send(alert('삭제되었습니다', '/board'));
	}
	catch(e) {
		if(connect) connect.release();
		next(createError(500, e.sqlMessage || e));
	}
});

router.get('/update/:id', async (req, res, next) => {
	let connect, rs, pug, temp;
	try {
		pug = {title: '게시글 수정', js: 'board', css: 'board'};
		temp = sqlGen('board', {mode: 'S', id: req.params.id});
		connect = await pool.getConnection();
		rs = await connect.query(temp.sql);
		connect.release();
		pug.list = rs[0][0];
		res.render('./board/write.pug', pug);
	}
	catch(e) {
		if(connect) connect.release();
		next(createError(500, e.sqlMessage || e));
	}
});

router.post('/saveUpdate', upload.single('upfile'), async (req, res, next) => {
	let connect, rs, temp;
	try {
		if(!req.allow) res.send(alert(`${req.ext}은(는) 업로드 할 수 없습니다.`, '/board'));
		else {
			connect = await pool.getConnection();
			if(req.file) {
				temp = sqlGen('board', {mode: 'S', id: req.body.id, field: ['savefile']});
				rs = await connect.query(temp.sql);
				if(rs[0][0].savefile) await fs.remove(uploadFolder(rs[0][0].savefile));
			}
			temp = sqlGen('board', {
				mode: 'U', 
				id: req.params.id, 
				field: ['title', 'writer', 'content'],
				file: req.file
			});
			rs = await connect.query(temp.sql, temp.values);
			connect.release();
			res.send(alert('수정되었습니다', '/board'));
		}
	}
	catch(e) {
		if(connect) connect.release();
		next(createError(500, e.sqlMessage || e));
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