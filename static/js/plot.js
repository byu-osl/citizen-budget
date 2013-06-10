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

function categoryPlot(data) {
    $("#categoryplot").highcharts({
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
	    verticalAlign: 'center',
	    layout: 'vertical'
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
	series: data
    });
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
