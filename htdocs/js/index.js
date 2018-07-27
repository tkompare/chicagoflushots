var Vaccinate = {

	Configs: null,
	Events: null,
	Map: null,
	Marker: null,
	i: null,

	loadScript: function() {
		$.when(
			$.getJSON("js/configure.json", function(configs) {
				Vaccinate.Configs = configs;
			})
		).then(function(){
			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = 'https://maps.googleapis.com/maps/api/js?key='+Vaccinate.Configs.GoogleMapsAPIKey+'&' +
				'callback=Vaccinate.initialize';
			document.body.appendChild(script);
		});
	},

	mdyToDate: function(mdy) {
		var mdyArray = mdy.split("/");
		return  new Date(mdyArray[2]+'-'+mdyArray[0]+'-'+mdyArray[1]);
	},

	intToDayName: function(int) {
		switch(int) {
			case 0:
				return 'Sunday';
			case 1:
				return 'Monday';
			case 2:
				return 'Tuesday';
			case 3:
				return 'Wednesday';
			case 4:
				return 'Thursday';
			case 5:
				return 'Friday';
			case 6:
				return 'Saturday';
			default:
				return 'ERROR';
		}
	},

	intToMonthName: function(int) {
		switch(int) {
			case 0:
				return 'January';
			case 1:
				return 'February';
			case 2:
				return 'March';
			case 3:
				return 'April';
			case 4:
				return 'May';
			case 5:
				return 'June';
			case 6:
				return 'July';
			case 7:
				return 'August';
			case 8:
				return 'September';
			case 9:
				return 'October';
			case 10:
				return 'November';
			case 11:
				return 'December';
			default:
				return 'ERROR';
		}
	},

	initialize: function(){
		$.when(
			$.getJSON('https://sheets.googleapis.com/v4/spreadsheets/'+Vaccinate.Configs.GoogleSheets.sheetID+'/values/'+Vaccinate.Configs.GoogleSheets.values+'?majorDimension='+Vaccinate.Configs.GoogleSheets.majorDimension+'&key='+Vaccinate.Configs.GoogleSheets.key, function(events) {
				Vaccinate.Events = events;
			})
		).then(function(){
			Vaccinate.Map = new google.maps.Map(document.getElementById('map'), {
				zoom: 12,
				center: Vaccinate.Configs.MapCenter,
				styles: Vaccinate.Configs.MapStyle,
				clickableIcons: false,
				mapTypeControl: false,
				panControl: false,
				streetViewControl: false,
				zoomControl: true,
				maxZoom: 18,
				minZoom: 10,
				zoomControlOptions: {
					position: google.maps.ControlPosition.RIGHT_TOP
				},
				fullscreenControl: false
			});
			for (Vaccinate.i = 0; Vaccinate.i < Vaccinate.Events['values'].length; Vaccinate.i++) {
				Vaccinate.Marker = new google.maps.Marker({
					position: new google.maps.LatLng(Vaccinate.Events['values'][Vaccinate.i][20], Vaccinate.Events['values'][Vaccinate.i][21]),
					map: Vaccinate.Map
				});
				google.maps.event.addListener(Vaccinate.Marker, 'click', (function(marker, i) {
					return function() {
						$('#modal-event-detail-title').html(Vaccinate.Events['values'][i][6]);
						var body = '<p>'+Vaccinate.Events['values'][i][0];
						if(Vaccinate.Events['values'][i][1].trim() !== ''){
							body += ' '+Vaccinate.Events['values'][i][1];
						}
						body += '<br>'+Vaccinate.Events['values'][i][2]+', '+Vaccinate.Events['values'][i][3]+' '+Vaccinate.Events['values'][i][4];
						var beginDate = Vaccinate.mdyToDate(Vaccinate.Events['values'][i][10]),
							formattedBeginDate = Vaccinate.intToDayName(beginDate.getUTCDay())+', '+Vaccinate.intToMonthName(beginDate.getUTCMonth())+' '+beginDate.getUTCDate()+', '+beginDate.getUTCFullYear();
						body += '<hr>'+formattedBeginDate;
						// Is this a single day event?
						if(Vaccinate.Events['values'][i][10] === Vaccinate.Events['values'][i][11]) {
							body += '<hr>Hours: '+Vaccinate.Events['values'][i][12]+' to '+Vaccinate.Events['values'][i][13];
							var cal = new ics(); // Make the ical! https://github.com/nwcell/ics.js
							cal.addEvent(Vaccinate.Events['values'][i][6], Vaccinate.Events['values'][i][18], Vaccinate.Events['values'][i][19], Vaccinate.Events['values'][i][10]+' '+Vaccinate.Events['values'][i][12], Vaccinate.Events['values'][i][11]+' '+Vaccinate.Events['values'][i][13]);
							$('#modal-event-detail-ical').on('click', function(){
								cal.download();
							});
						} else {
							var endDate = Vaccinate.mdyToDate(Vaccinate.Events['values'][i][11]),
								formattedEndDate = Vaccinate.intToDayName(endDate.getUTCDay())+', '+Vaccinate.intToMonthName(endDate.getUTCMonth())+' '+endDate.getUTCDate()+', '+endDate.getUTCFullYear();
							body += ' to '+formattedEndDate;
						}
						body += '<p>';
						$('#modal-event-detail-body').html(body);
						$('#modal-event-detail').modal('show');
					}
				})(Vaccinate.Marker, Vaccinate.i));
			}
		});
	}

};

window.onload = Vaccinate.loadScript;