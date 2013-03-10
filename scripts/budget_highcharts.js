var BudgetHighcharts = BudgetHighcharts || {};  
var BudgetHighcharts = 
{  
  apropColor:   '#264870',
  apropSymbol:  'circle',
  apropTitle:   'Budgeted',
  
  expendColor:  '#7d9abb',
  expendSybmol: 'square',
  expendTitle:  'Spent',
  
  //*************************************************************************************
  //displays main graph using highcharts (http://www.highcharts.com)
  //*************************************************************************************
  updateMainChart: function() 
  {
    var minValuesArray = $.grep(BudgetLib.appropTotalArray.concat(BudgetLib.expendTotalArray), 
      function(val) { return val != null; });
    
    // Highcharts
    mainChart = new Highcharts.Chart({
      chart: {
        borderColor: "#dddddd",
        borderRadius: 0,
        borderWidth: 1,
        defaultSeriesType: "area",
        marginBottom: 60,
        marginLeft: 60,
        marginRight: 22,
        marginTop: 20,
        renderTo: "timeline-chart"
      },
      credits: { enabled: false },
      legend: {
        backgroundColor: "#ffffff",
        borderColor: "#cccccc",
        floating: true,
        verticalAlign: "top",
        x: -300,
        y: 20
      },
      
      //Handle Highlighting and Clicking of Points on Graph
      plotOptions:
      {
        area: { fillOpacity: 0.25 },
        series: {
          lineWidth: 5,
          point:
          {
            events: {
              click: function() 
              {
                var x        = this.x,
                    y        = this.y,
                    selected = !this.selected,
                    index    = this.series.index;
                this.select(selected, false);
    
                $.each(this.series.chart.series, function(i, serie) 
                {
                  if (serie.index !== index) 
                  {
                    $(serie.data).each(function(j, point){
                      if(x === point.x && point.y != null) 
                      {
                        point.select(selected, true);
                  }});}
                });
                
                var clickedYear = BudgetHelpers.convertToSlug(this.category);
                $.address.parameter('year', clickedYear);
                
              }
            }
          },
          shadow: false
        }
      },
      
      // ------------- LOAD DATA -----------------//
      series:
      [
        {
          color: this.expendColor,
          data: BudgetLib.expendTotalArray,
          marker: {
            radius: 8,
            symbol: this.expendSybmol
          },
          name: this.expendTitle
        },
        
        {
          color: this.apropColor,
          data: BudgetLib.appropTotalArray,
          marker: {
            radius: 6,
            symbol: this.apropSymbol
          },
          name: this.apropTitle
        },
      ],
      title: null,
      
      //SET_UP the Floating Tooltip, Which appears as one hovers over each year.
      tooltip:
      {
        borderColor: "#000",
        formatter: function()
        {
          // YEAR
          var s = "<strong>" + (BudgetLib.dateYearOnly ? this.x.split("/")[2] : this.x )+ "</strong>";
          // $$ Budgeted // Expenditures
          $.each(this.points, function(i, point) {
            s += "<br /><span style=\"color: " + point.series.color + "\">" + point.series.name + ":</span> $" + Highcharts.numberFormat(point.y, 0);
          });
          return s;
        },
        shared: true
      },
      xAxis:
      {
        categories: BudgetLib.dates,
        tickmarkPlacement: 'on',
        labels:
        {
          overflow: 'justify',
          rotation: 45,
          align: 'left',
          style:
          {
            fontSize: 12,
            fontWeight: 'bold'
          },
          formatter: function()
          {
              return BudgetLib.dateYearOnly ? this.value.split("/")[2] : this.value;
          }
        }
      },
      yAxis:
      {
        gridLineColor: "#ddd",
        lineWidth: 1,
        labels:
        {
          formatter: function() { return BudgetHighcharts.formatAmount(this.value); },
          style:
          {
            fontSize: 12,
            fontWeight: 'bold'
          }
        },
        min: Math.min.apply( Math, minValuesArray ),
        title: null
      }
    });
    
    //select the current year on load
    var selectedYearIndex = BudgetLib.loadYear - BudgetLib.startYear;
    if (mainChart.series[0].data[selectedYearIndex].y != null)
      mainChart.series[0].data[selectedYearIndex].select(true,true);
      
    if (mainChart.series[1].data[selectedYearIndex].y != null)
      mainChart.series[1].data[selectedYearIndex].select(true,true);
  },
  
  //*************************************************************************************
  //This function formates a number according to its size in Billions/Millions
  // ie: 1,000,000,000 becomes $1B
  //     1,000,000     becomes $1M
  //     1,000         becomes 1,000
  //*************************************************************************************
  formatAmount: function(value) {
    if (value >= 1000000000)
      return "$" + value / 1000000000 + "B";
    else if (value >= 1000000)
      return "$" + value / 1000000 + "M";
    else
      return "$" + value;
  },
  
  //*************************************************************************************
  // TOOD PIE
  //*************************************************************************************
  updatePieChart: function (renderToDiv, pieTitle, theData)
  {
    expenditurePie = new Highcharts.Chart(
    {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            renderTo: renderToDiv,
            style: {
                overflow: "visible"
            }
            
        },
        credits: { enabled: false },
        title: {
            text: pieTitle
        },
        tooltip: {
            //pointFormat: '{series.name}: <b>'+ point.y+'%</b>',
            formatter: function () {return this.point.name + '<br/><b>' + this.y + '%</b>';},
            percentageDecimals: 1,
            useHTML: true,
            style: {
              overflow: "visible"
            }
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                showInLegend: true,
                dataLabels: {enabled: false}
            }
        },
        series: [{
            type: 'pie',
            name: 'Browser share',
            data: theData
        }]
    });
  }
}
