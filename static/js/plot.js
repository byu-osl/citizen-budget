var previousPoint = null;

/* Line Plots */

function yearPlot(data) {
    $("#yearplot").highcharts({
	chart: {
	    type: 'line',
	},
	colors: [
	    '#2c729e',
	    '#7a9942',
	    '#8c2e2e',
	    '#08a689',
	    '#82bf56',
	    '#77a1e5', /* baby blue */
	    '#f28f43', /* orange */
	    '#8bbc21', /* green */
	    '#0d233a', /* dark blue */
	    '#910000', /* red */
	    '#0b0080', /* deep blue */
	    '#800023', /* deep red */
	    '#492970', /* purple */
	    '#a6c96a', /* light green */
	    '#c42525', /* light red */
	    '#1aadce', /* light blue */
	    '#2f7ed8', /* blue */
	],
	title: {
	    text: null,
	},
	legend: {
	    align: 'right',
	    verticalAlign: 'top',
	    floating: true,
	},
	xAxis: {
	    type: 'category',
	},
	yAxis: {
            title: {
                text: null,
            }
        },
	credits: {
            enabled: false
        },
	plotOptions: {
            series: {
                cursor: 'pointer',
                point: {
                    events: {
                        click: function() {
			    $.ajax({
				method : 'get',
				url : "/year/" + this.x,
				success: function(html) {
				    $("#year-charts").html(html);
				},
			    });
			}
		    }
		}
	    }
	},
	series: data
    });
}

function fundPlot(fund,data) {
    $("#fundplot").highcharts({
	chart: {
	    type: 'line',
	},
	colors: [
	    '#2c729e',
	    '#7a9942',
	    '#8c2e2e',
	    '#08a689',
	    '#82bf56',
	    '#77a1e5', /* baby blue */
	    '#f28f43', /* orange */
	    '#8bbc21', /* green */
	    '#0d233a', /* dark blue */
	    '#910000', /* red */
	    '#0b0080', /* deep blue */
	    '#800023', /* deep red */
	    '#492970', /* purple */
	    '#a6c96a', /* light green */
	    '#c42525', /* light red */
	    '#1aadce', /* light blue */
	    '#2f7ed8', /* blue */
	],
	title: {
	    text: null,
	},
	legend: {
	    align: 'right',
	    verticalAlign: 'top',
	    floating: true,
	},
	xAxis: {
	    type: 'category',
	},
	yAxis: {
            title: {
                text: null,
            }
        },
	credits: {
            enabled: false
        },
	plotOptions: {
            series: {
                cursor: 'pointer',
                point: {
                    events: {
                        click: function() {
			    window.location.replace("/year/" + this.x + "/" + fund);
			}
		    }
		}
	    }
	},
	series: data
    });
}

function fundPlotld(fund,data) {
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

function barPlot(id,type,colors,data) {
    $(id).highcharts({
	chart: {
	    type: type
	},
	colors: colors,
	title: {
	    text: null,
	},
	legend: {
	    enabled: false,
	},
	xAxis: {
	    type: 'category',
	},
	yAxis: {
            title: {
                text: null,
            }
        },
	credits: {
            enabled: false
        },
	plotOptions: {
            series: {
                cursor: 'pointer',
                point: {
                    events: {
                        click: function() {
			    $.ajax({
				method : 'get',
				url : "/year/" + this.x,
				success: function(html) {
				    $("#year-charts").html(html);
				},
			    });
			}
		    }
		}
	    }
	},
	series: data
    });
}

function barPlotOld(id,data) {
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
