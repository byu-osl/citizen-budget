/* Install */

function finish() {
    $.ajax({
        method : 'post',
        url : '/admin/install',
	success: function(url) {
	    window.location.replace(url);
	},
	error: function (xhr, ajaxOptions, thrownError) {
	    $('#user-error').html(xhr.responseText);
	}
    });
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

/* Users */

function setUserForm(user) {
    if (user == undefined) {
	$('#user-modal input[name="name"]').val('');
	$('#user-modal input[name="email"]').val('');
	$('#user-modal input[name="phone"]').val('');
	$('#user-modal input[name="carrier"]').val('');
	$('#user-modal-submit').unbind('click').click(addUser);
    } else {
	$('#user-modal input[name="name"]').val(user['name']);
	$('#user-modal input[name="email"]').val(user['email']);
	$('#user-modal input[name="phone"]').val(user['phone']);
	$('#user-modal input[name="carrier"]').val(user['carrier']);
	$('#user-modal-submit').attr('data-id',user['id']);
	$('#user-modal-submit').unbind('click').click(editUser);
    }
}

function addUser() {
    $('#user-form').ajaxSubmit({
        method : 'post',
        url : '/admin/users/add',
	success: function(html) {
	    $('#user-error').html('');
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
        url : '/admin/users/edit/' + userID,
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
        url : '/admin/users/remove/' + userID,
	success: function(html) {
	    $('#user-info').html(html);
	},
	error: function (xhr, ajaxOptions, thrownError) {
	    window.location.replace('/admin/login');
	}
    });
}

/* Users */

function setFinancialForm(financial) {
    if (financial == undefined) {
	$('#financial-modal input[name="year"]').val('');
	$('#financial-modal input[name="name"]').val('');
	$('#financial-modal-submit').unbind('click').click(addFinancial);
    } else {
	$('#financial-modal input[name="year"]').val(financial['year']);
	$('#financial-modal input[name="name"]').val(financial['name']);
	$('#financial-modal-submit').attr('data-id',financial['id']);
	$('#financial-modal-submit').unbind('click').click(editFinancial);
    }
}

function addFinancial() {
    $('#financial-form').ajaxSubmit({
        method : 'post',
        url : '/admin/financials/add',
	success: function(html) {
	    $('#financial-info').html(html);
	},
	error: function (xhr, ajaxOptions, thrownError) {
	    window.location.replace('/admin/login');
	}
    });
}

function editFinancial() {
    var fileID = $(this).attr('data-id');
    $('#financial-form').ajaxSubmit({
        method : 'post',
        url : '/admin/financials/edit/' + fileID,
	success: function(html) {
	    $('#financial-info').html(html);
	},
	error: function (xhr, ajaxOptions, thrownError) {
	    window.location.replace('/admin/login');
	}
    });
}

function removeFinancial(fileID) {
    $.ajax({
        method : 'post',
        url : '/admin/financials/remove/' + fileID,
	success: function(html) {
	    $('#financial-info').html(html);
	},
	error: function (xhr, ajaxOptions, thrownError) {
	    window.location.replace('/admin/login');
	}
    });
}
