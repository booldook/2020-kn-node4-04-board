const path = require('path');

const alert = (msg, loc=null) => {
	var html = `<script>alert('${msg}');`;
	if(loc) html += `location.href='${loc}'`;
	html += `</script>`;
	return html;
}

const uploadFolder = (filename) => {
	return path.join(__dirname, '../uploads', filename.substr(0, 6), filename);
}

const imgFolder = (filename) => {
	return path.join('/storage', filename.substr(0, 6), filename);
}

const extGen = (filename, mode='L') => {
	let ext = path.extname(filename).replace(".", "");
	return mode == 'U' ? ext.toUpperCase() : ext.toLowerCase(); 
}

module.exports = { alert, uploadFolder, imgFolder, extGen };