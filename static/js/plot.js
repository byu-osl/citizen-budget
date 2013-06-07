var previousPoint = null;

/* Line Plots */

function yearPlot(data) {
    var options = {
        'points' : { 'show': true },
        'lines' : { 'show': true },
	'xaxis': { 'minTickSize' : 1, 'tickDecimals' : 0 },
	'yaxis': { 'tickFormatter': suffixFormatter, 'tickDecimals': 1 },
	'grid': { 'clickable': true, 'hoverable': true }
    }
    $.plot($("#yearplot"), data, options);
    $("#yearplot").bind("plotclick",function(event, pos, item) {
	if (item) {
	    $.ajax({
		method : 'get',
		url : "/year/" + item.datapoint[0],
		success: function(html) {
		    $("#year-charts").html(html);
		},
	    });
	}
    });
    $("#yearplot").bind("plothover", hover);
}

function fundPlot(fund,data) {
    var options = {
        'points' : { 'show': true },
        'lines' : { 'show': true },
	'xaxis': { 'minTickSize' : 1, 'tickDecimals' : 0 },
	'yaxis': { 'tickFormatter': suffixFormatter, 'tickDecimals': 1 },
	'grid': { 'clickable': true, 'hoverable': true }
    }
    $.plot($("#fundplot"), data, options);
    $("#fundplot").bind("plotclick",function(event, pos, item) {
	if (item) {
	    window.location.replace("/year/" + item.datapoint[0] + "/" + fund);
	}
    });
    $("#fundplot").bind("plothover", hover);
}

function hover(event, pos, item) {
    if (item) {
        if (previousPoint != item.dataIndex) {
	    previousPoint = item.dataIndex;
                    
	    $("#tooltip").remove();
	    var x = item.datapoint[0]
	    var y = item.datapoint[1].toFixed(2);
	    showTooltip(item.pageX, item.pageY,
                        "Year: " + x + "<br>Amount: " + numberWithCommas(y));
        }
    }
    else {
        $("#tooltip").remove();
        previousPoint = null;            
    }
}

/* Bar Plots */

function barPlot(id,data) {
    var options = {
	'xaxis': { 'minTickSize' : 0.01, 'tickFormatter': fundFormatter,
		   'autoscaleMargin': 0.01, 'tickLength': 0},
	'yaxis': { 'tickFormatter': suffixFormatter, 'tickDecimals': 1 },
        'lines' : { 'show': false },
	'bars': { 'show': true, 'lineWidth' : 1, 
		  'fill': 1, 'barWidth': 0.25, 'align':'left',
		  'horizontal': false
		}
    }
    $.plot(id, data, options);
}

function horizontalPlot(id,data) {
    var options = {
	'yaxis': { 'mode': 'categories'},
	'xaxis': { 'tickFormatter': suffixFormatter, 'tickDecimals': 1 },
        'lines' : { 'show': false },
	'bars': { 'show': true, 'lineWidth' : 1, 
		  'fill': 1, 'barWidth': 0.25, 'align':'left',
		  'horizontal': true
		}
    }
    $.plot(id, data, options);
}

/* Helpers */

function showTooltip(x, y, contents) {
    var xval = x - 50;

    $('<div id="tooltip">' + contents + '</div>').css( {
        position: 'absolute',
        display: 'none',
        top: y + 20,
        left: xval,
        border: '2px solid #666',
	'border-radius': '5px',
        padding: '5px',
        'background-color': '#fff',
        opacity: 0.8
    }).appendTo("body").fadeIn(200);
}

function fundFormatter(val, axis) {
    if (!fundMapper[val]) {
	return ''
    }
    return fundMapper[val]
}

function suffixFormatter(val, axis) {
    if (val >= 1000000 || val <= 1000000)
        return (val / 1000000).toFixed(axis.tickDecimals) + " M";
    else if (val >= 1000 || val <= 1000)
        return (val / 1000).toFixed(axis.tickDecimals) + " K";
    else
        return val.toFixed(axis.tickDecimals);
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
