function setForm(user) {
    if (user == undefined) {
	$('#user-modal input[name="name"]').val('');
	$('#user-modal input[name="email"]').val('');
	$('#user-modal input[name="phone"]').val('');
	$('#user-modal input[name="carrier"]').val('');
	$('#user-modal-submit').click(addUser);
    } else {
	$('#user-modal input[name="name"]').val(user['name']);
	$('#user-modal input[name="email"]').val(user['email']);
	$('#user-modal input[name="phone"]').val(user['phone']);
	$('#user-modal input[name="carrier"]').val(user['carrier']);
	$('#user-modal-submit').attr('data-id',user['id']);
	$('#user-modal-submit').click(editUser);
    }
}

/* Login */

function getCode() {
    $('#code-spinner').show();
    $('#code-info').html('');
    $('#code-form').ajaxSubmit({
        method : 'post',
        url : '/admin/login/getcode',
	success : function(html) {
	    $('#code-spinner').hide();
	    $('#code-error').html('');
	    $('#code-info').html(html);
	    $('#login-form input[name="email"]').val($('#code-form input[name="email"]').val());

	},
	error: function (xhr, ajaxOptions, thrownError) {
	    $('#code-spinner').hide();
	    $('#code-error').html(xhr.responseText);
	}
    });
}

function sendCode() {
    $('#login-spinner').show();
    $('#login-form').ajaxSubmit({
        method : 'post',
        url : '/admin/login/sendcode',
	success : function(url) {
	    $('#login-spinner').hide();
	    window.location.replace(url);
	},
	error: function (xhr, ajaxOptions, thrownError) {
	    $('#login-spinner').hide();
	    $('#login-error').html(xhr.responseText);
	}
    });
}


/* City */

function updateCity() {
    $('#city-form').ajaxSubmit({
        method : 'post',
        url : '/admin/city',
	success: function(html) {
	    $('#city-info').html(html);
	},
	error: function (xhr, ajaxOptions, thrownError) {
	    window.location.replace('/admin/login');
	}
    });
}

/* Users */

function addUser() {
    $('#user-form').ajaxSubmit({
        method : 'post',
        url : '/admin/user/add',
	success: function(html) {
	    $('#user-info').html(html);
	},
	error: function (xhr, ajaxOptions, thrownError) {
	    window.location.replace('/admin/login');
	}
    });
}

function editUser() {
    var userID = $(this).attr('data-id');
    $('#user-form').ajaxSubmit({
        method : 'post',
        url : '/admin/user/edit/' + userID,
	success: function(html) {
	    $('#user-info').html(html);
	},
	error: function (xhr, ajaxOptions, thrownError) {
	    window.location.replace('/admin/login');
	}
    });
}

function removeUser(userID) {
    $.ajax({
        method : 'post',
        url : '/admin/user/remove/' + userID,
	success: function(html) {
	    $('#user-info').html(html);
	},
	error: function (xhr, ajaxOptions, thrownError) {
	    window.location.replace('/admin/login');
	}
    });
}
