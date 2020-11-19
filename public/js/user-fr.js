function onBlur() {
	var userid = document.joinForm.userid.value;
	if(userid.length < 8) {
		$(".valid")
		.html('아이디는 8자 이상이어야 됩니다.')
		.css({"display": "block", "color": "red"});
		$("input[name='useridValid']").val('');
	}
	else {
		$.get('/user/idchk/'+userid, function(r) {
			if(r.code == 200) {
				if(r.isUsed) {
					$(".valid")
					.html('멋진 아이디 입니다! 사용할 수 있습니다.')
					.css({"display": "block", "color": "blue"});
					$("input[name='useridValid']").val('valid');
				}
				else {
					$(".valid")
					.html('사용할 수 없습니다.')
					.css({"display": "block", "color": "red"});
					$("input[name='useridValid']").val('');
				}
			}
			else console.log(r);
		});
	}
}

$("form[name='joinForm'] input[name='userid']").on("blur", onBlur);


function onJoin(f) {
	if(f.useridValid.value.trim() == '' || f.userpw.value.trim() == '' || f.username.value.trim() == '') {
		alert('올바르게 기입해 주세요.');
		return false;
	}
	return true;
}

function onLogin(f) {
	if(f.userid.value.trim() == '' || f.userpw.value.trim() == '') {
		alert('올바르게 기입해 주세요.');
		return false;
	}
	return true;
}

