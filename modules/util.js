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

module.exports = { alert, uploadFolder };