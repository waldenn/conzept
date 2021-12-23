'use strict';

const explore = {

  symbol    : getParameterByName('s') || '',
  language  : getParameterByName('l') || 'en',
  currency  : getParameterByName('c') || 'USD',
  company   : getParameterByName('t') || '',
  place     : getParameterByName('p') || '',

};

(function() {

  if ( explore.symbol === '' ){

    return 0;

  }

  var roundUpto = function(number, upto){
    return Number(number.toFixed(upto));
  }

  angular
    .module("stockPriceWidget", [])
    .controller("MainCtrl", ["$http", "alphavantage", "chart",
    function($http, alphavantage, chart) {
      var vm = this;
      vm.symbol = explore.symbol;
      vm.timeInterval = "days";
      vm.timeIntervalValue = 182;
      
      vm.setDataRange = function(numberOfDays){
        chart.update(vm.dataSet, vm.timeInterval, numberOfDays);
      }
      
      function getData() {
        alphavantage.getDailyDataSet(vm.symbol)
          .then(response => {
            vm.dataSet = response;
            chart.renderChart(vm.dataSet, vm.timeInterval, vm.timeIntervalValue);
            vm.currentClosingPrice = parseFloat(alphavantage.getCurrentClosingPrice(vm.dataSet, "Daily")).toFixed(2);
            vm.gainLoss = alphavantage.calculateGainLoss(vm.dataSet, "Daily");
            vm.currency = explore.currency;
            vm.company  = explore.company;
            vm.place    = explore.place;
            //vm.perc     = parseFloat(parseFloat( ( vm.gainLoss / vm.currentClosingPrice ) * 100  ).toFixed(4));
            vm.perc     = roundUpto( ( vm.gainLoss / vm.currentClosingPrice ) * 100, 2 ) + '%';
        });
      }
      
      getData();
      
    }
  ])
  .constant("APIKEY", "9V66ST5SY883CWI1")
  .factory("alphavantage", ["$http", "APIKEY", function($http, APIKEY){
    
    var _latestDate;
    var _currentClosingPrice;
    
    function getDailyDataSet(symbol){
      return $http.get("https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=" + symbol + "&apikey=" + APIKEY)
        .then(response => {
          return response.data;
        });
    }
    
    function getInterDayDataSet(symbol){
      return $http.get("https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=" + symbol + "&interval=1min&apikey=" + APIKEY)
        .then(response => {
          return response.data;
        });
    }
    
    function getLatestDate(dataSet, timeInterval){
      _latestDate = moment();
      var dates = Object.keys(dataSet["Time Series (" + timeInterval + ")"]).map(d => moment(d));
      dates.forEach((date, i, a) => {
        _latestDate = (i === 0 || date.isAfter(_latestDate)) ? date : _latestDate;
      });
      return _latestDate;
    }
    
    function getCurrentClosingPrice(dataSet, timeInterval){
      var latest = getLatestDate(dataSet, timeInterval);
      _currentClosingPrice = dataSet["Time Series (" + timeInterval + ")"][latest.format("YYYY-MM-DD")]["4. close"];
      return _currentClosingPrice;
    }
    
    function calculateGainLoss(dataSet, timeInterval){
      //var currentClosingPrice = getCurrentClosingPrice(dataSet, timeInterval);
      var previousClosingPrice = 
            dataSet["Time Series (" + timeInterval + ")"][_latestDate.subtract(1, "days").format("YYYY-MM-DD")]["4. close"];
      return parseFloat(_currentClosingPrice - previousClosingPrice).toFixed(2);
    }
    
    return {
      getDailyDataSet: getDailyDataSet,
      getInterDayDataSet: getInterDayDataSet,
      getCurrentClosingPrice: getCurrentClosingPrice,
      calculateGainLoss: calculateGainLoss
    }
  }])
  .factory("dataSetFormatter", [function(){
    function format(dataSet, dayMonthYear, value){
      var formattedDataSet = {};
      formattedDataSet.closingValues = [];
      formattedDataSet.openingValues = [];
      formattedDataSet.highValues = [];
      formattedDataSet.lowValues = [];
      
      //get an array of all the dataSet date keys
      var dates = Object.keys(dataSet).map(d => moment(d));
      for(var i = dates.length - 1; i >= 0; i--){
        if(!dates[i].isSameOrAfter(moment().subtract(value, dayMonthYear))){
          dates.splice(i, 1);
        }
      }
      
      //now that we have a set of dates to target, we can iterate
      //over the new date set grabbing the corresponding objects in dataSet
      //and populating formattedDataSet
      dates.forEach(d => {
        var closingObj = {};
        closingObj.x = d;
        closingObj.y = dataSet[d.format("YYYY-MM-DD")]["4. close"];
        formattedDataSet.closingValues.push(closingObj);
        var openingObj = {};
        openingObj.x = d;
        openingObj.y = dataSet[d.format("YYYY-MM-DD")]["1. open"];
        formattedDataSet.openingValues.push(openingObj);
        var highObj = {};
        highObj.x = d;
        highObj.y = dataSet[d.format("YYYY-MM-DD")]["2. high"];
        formattedDataSet.highValues.push(highObj);
        var lowObj = {};
        lowObj.x = d;
        lowObj.y = dataSet[d.format("YYYY-MM-DD")]["3. low"];
        formattedDataSet.lowValues.push(lowObj);
      });
      return formattedDataSet;
    }
    
    return {
      format: format
    }
  }])
  .factory("chart", ["dataSetFormatter", function(dataSetFormatter){
    var priceChart;
    
    function update(dataSet, timeInterval, timeIntervalValue){
      var formattedDataSet = dataSetFormatter.format(dataSet["Time Series (Daily)"], timeInterval, timeIntervalValue);
      priceChart.data.datasets[0].data = formattedDataSet.closingValues;
      priceChart.data.datasets[1].data = formattedDataSet.openingValues;
      priceChart.data.datasets[2].data = formattedDataSet.highValues;
      priceChart.data.datasets[3].data = formattedDataSet.lowValues;

      priceChart.update();
    }
    
    function renderChart(dataSet, timeInterval, timeIntervalValue) {
        var formattedDataSet = dataSetFormatter.format(dataSet["Time Series (Daily)"], timeInterval, timeIntervalValue);
        //var formattedDataSet = getChartData(vm.dataSet["Time Series (Daily)"]);
        Chart.defaults.global.defaultFontFamily = "'Open Sans', sans-serif";
        var ctx = document.getElementById("myChart").getContext("2d");


				/*
				var myChart = new Chart(ctx, {
						type: 'line',
						data: {
								labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
								datasets: [{
										label: '# of Votes',
										data: [12, 19, 3, 5, 2, 3]
								}]
						},
						options: {
								scales: {
										yAxes: [{
												ticks: {
														beginAtZero:true
												}
										}]
								},
								plugins: {
										zoom: {
												// Container for pan options
												pan: {
														// Boolean to enable panning
														enabled: true,

														// Panning directions. Remove the appropriate direction to disable 
														// Eg. 'y' would only allow panning in the y direction
														mode: 'xy'
												},

												// Container for zoom options
												zoom: {
														// Boolean to enable zooming
														enabled: true,

														// Zooming directions. Remove the appropriate direction to disable 
														// Eg. 'y' would only allow zooming in the y direction
														mode: 'xy',
												}
										}
								}
						}
				});
				*/


        priceChart = new Chart(ctx, {
          type: "line",
          data: {
            datasets: [
              {
                label: "Closing Value",
                data: formattedDataSet.closingValues,
                borderColor: ["blue"],
                borderWidth: 1,
                fill: false
              },
              {
                label: "Opening Value",
                data: formattedDataSet.openingValues,
                borderColor: ["red"],
                borderWidth: 1,
                fill: false,
                hidden: true,
              },
              {
                label: "High",
                data: formattedDataSet.highValues,
                borderColor: ["green"],
                borderWidth: 1,
                fill: false,
                hidden: true,
              },
              {
                label: "Low",
                data: formattedDataSet.lowValues,
                borderColor: ["orange"],
                borderWidth: 1,
                fill: false,
                hidden: true,
              }
            ]
          },
          options: {
            responsive: true,
            scales: {

							/*
							yAxes: [{
									ticks: {
											beginAtZero:true
									}
							}],
							*/

              xAxes: [
                {
                  type: "time",
                  time: {
                    displayFormats: {
                      month: "MMM YYYY"
                    }
                  }
                }
              ]
            },


						plugins: {
								zoom: {
										// Container for pan options
										pan: {
												// Boolean to enable panning
												enabled: true,

												// Panning directions. Remove the appropriate direction to disable 
												// Eg. 'y' would only allow panning in the y direction
												mode: 'xy'
										},

										// Container for zoom options
										zoom: {
												// Boolean to enable zooming
												enabled: true,

												// Zooming directions. Remove the appropriate direction to disable 
												// Eg. 'y' would only allow zooming in the y direction
												mode: 'xy',
										}
								}
						}

						/*
						plugins: {
							zoom: {
								// Container for pan options
								pan: {
									// Boolean to enable panning
									enabled: true,

									// Panning directions. Remove the appropriate direction to disable
									// Eg. 'y' would only allow panning in the y direction
									// A function that is called as the user is panning and returns the
									// available directions can also be used:
									//   mode: function({ chart }) {
									//     return 'xy';
									//   },
									mode: 'xy',

									rangeMin: {
										// Format of min pan range depends on scale type
										x: null,
										y: null
									},
									rangeMax: {
										// Format of max pan range depends on scale type
										x: null,
										y: null
									},

									// On category scale, factor of pan velocity
									speed: 20,

									// Minimal pan distance required before actually applying pan
									threshold: 10,

									// Function called while the user is panning
									onPan: function({chart}) { console.log(`I'm panning!!!`); },
									// Function called once panning is completed
									onPanComplete: function({chart}) { console.log(`I was panned!!!`); }
								},

								// Container for zoom options
								zoom: {
									// Boolean to enable zooming
									enabled: true,

									// Enable drag-to-zoom behavior
									drag: true,

									// Drag-to-zoom effect can be customized
									// drag: {
									// 	 borderColor: 'rgba(225,225,225,0.3)'
									// 	 borderWidth: 5,
									// 	 backgroundColor: 'rgb(225,225,225)',
									// 	 animationDuration: 0
									// },

									// Zooming directions. Remove the appropriate direction to disable
									// Eg. 'y' would only allow zooming in the y direction
									// A function that is called as the user is zooming and returns the
									// available directions can also be used:
									//   mode: function({ chart }) {
									//     return 'xy';
									//   },
									mode: 'xy',

									rangeMin: {
										// Format of min zoom range depends on scale type
										x: null,
										y: null
									},
									rangeMax: {
										// Format of max zoom range depends on scale type
										x: null,
										y: null
									},

									// Speed of zoom via mouse wheel
									// (percentage of zoom on a wheel event)
									speed: 0.1,

									// Minimal zoom distance required before actually applying zoom
									threshold: 2,

									// On category scale, minimal zoom level before actually applying zoom
									sensitivity: 3,

									// Function called while the user is zooming
									onZoom: function({chart}) { console.log(`I'm zooming!!!`); },
									// Function called once zooming is completed
									onZoomComplete: function({chart}) { console.log(`I was zoomed!!!`); }
								}
							}
						},
						*/




          },

        });
      }
    return {
      renderChart: renderChart,
      update: update
    }
  }])
})();
