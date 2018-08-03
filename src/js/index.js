var Vaccinate = {

	Configs: null,
	Events: null,
	Map: null,
	Marker: null,
	i: null, // Events iterator

	loadScript: function() {
		$.when(
			/*
			 * Get the configuration for the application from the configuration JSON file.
			 */
			$.getJSON("js/configure.json", function(configs) {
				Vaccinate.Configs = configs;
			})
		).then(function(){
			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = 'https://maps.googleapis.com/maps/api/js?key='+Vaccinate.Configs.Google.key+'&' +
				'callback=Vaccinate.initialize';
			document.body.appendChild(script);
		});
	},

	mdyToDate: function(mdy) {
		var mdyArray = mdy.split("/");
		// add in leading zero if month or date are one character in length
		for(var j=0; j<mdyArray.length; j++){
			if(mdyArray[j].length === 1 ){
				mdyArray[j] = '0'+mdyArray[j];
			}
		}
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
			/*
			 * Get event data from a Google Spreadsheet.
			 */
			$.getJSON('https://sheets.googleapis.com/v4/spreadsheets/'+Vaccinate.Configs.Google.sheet.id+'/values/'+Vaccinate.Configs.Google.sheet.values+'?majorDimension='+Vaccinate.Configs.Google.sheet.majorDimension+'&key='+Vaccinate.Configs.Google.key, function(events) {
				// Use map/reduce to transform Sheet data to an array of objects using the first 'row' to define properties
				var keys = events.values.shift();
				Vaccinate.Events = events.values.map(function(values) {
					return keys.reduce(function(object, key, i) {
						object[key] = values[i];
						return object;
					}, {});
				});
			})
		).then(function(){
			Vaccinate.Map = new google.maps.Map(document.getElementById('map'), {
				zoom: Vaccinate.Configs.Map.zoom,
				center: Vaccinate.Configs.Map.center,
				styles: Vaccinate.Configs.Map.styles,
				clickableIcons: Vaccinate.Configs.Map.clickableIcons,
				mapTypeControl: Vaccinate.Configs.Map.mapTypeControl,
				panControl: Vaccinate.Configs.Map.panControl,
				streetViewControl: Vaccinate.Configs.Map.streetViewControl,
				zoomControl: Vaccinate.Configs.Map.zoomControl,
				maxZoom: Vaccinate.Configs.Map.maxZoom,
				minZoom: Vaccinate.Configs.Map.minZoom,
				zoomControlOptions: {
					"position": google.maps.ControlPosition.RIGHT_TOP
				},
				fullscreenControl: Vaccinate.Configs.Map.fullscreenControl
			});

			for (Vaccinate.i = 0; Vaccinate.i < Vaccinate.Events.length; Vaccinate.i++) {
				Vaccinate.Marker = new google.maps.Marker({
					position: new google.maps.LatLng(Vaccinate.Events[Vaccinate.i]['Latitude'], Vaccinate.Events[Vaccinate.i]['Longitude']),
					map: Vaccinate.Map
				});
				google.maps.event.addListener(Vaccinate.Marker, 'click', (function(marker, i) {
					return function() {
						$('#modal-event-detail-title').html(Vaccinate.Events[i]['LocationName']);
						var body = '<p>'+Vaccinate.Events[i]['Address1'];
						if(Vaccinate.Events[i]['Address2'].trim() !== ''){
							body += ' '+Vaccinate.Events[i]['Address2'];
						}
						body += '<br>'+Vaccinate.Events[i]['City']+', '+Vaccinate.Events[i]['State']+' '+Vaccinate.Events[i]['PostalCode'];
						if(Vaccinate.Events[i]['Phone'] !== '' || Vaccinate.Events[i]['Contact'] !== '') {
							body += '<br>';
							if(Vaccinate.Events[i]['Contact'] !== '') {
								body += 'Contact: '+Vaccinate.Events[i]['Contact'];
							}
							if(Vaccinate.Events[i]['Phone'] !== '' && Vaccinate.Events[i]['Contact'] !== '') {
								body += ' at ';
							}
							if(Vaccinate.Events[i]['Phone'] !== '') {
								body += Vaccinate.Events[i]['Phone'];
							}
						}
						if(Vaccinate.Events[i]['Url'] !== '') {
							body += '<br><a href="'+Vaccinate.Events[i]['Url']+'" target="_blank">'+Vaccinate.Events[i]['Url']+'</a>';
						}
						var beginDate = Vaccinate.mdyToDate(Vaccinate.Events[i]['BeginDate']),
							formattedBeginDate = Vaccinate.intToDayName(beginDate.getUTCDay())+', '+Vaccinate.intToMonthName(beginDate.getUTCMonth())+' '+beginDate.getUTCDate()+', '+beginDate.getUTCFullYear();
						body += '<hr>'+formattedBeginDate;
						// If this is single day event...
						if(Vaccinate.Events[i]['BeginDate'] === Vaccinate.Events[i]['EndDate']) {
							body += '<hr>Hours: '+Vaccinate.Events[i]['BeginTime']+' to '+Vaccinate.Events[i]['EndTime'];
							var cal = new ics(); // Make the ical! https://github.com/nwcell/ics.js
							cal.addEvent(Vaccinate.Events[i]['LocationName'],
								Vaccinate.Events[i]['NotesText']+" "+Vaccinate.Events[i]['Contact']+" "+Vaccinate.Events[i]['Phone']+" "+Vaccinate.Events[i]['Url'],
								Vaccinate.Events[i]['FormattedAddress'],
								Vaccinate.Events[i]['BeginDate']+' '+Vaccinate.Events[i]['BeginTime'],
								Vaccinate.Events[i]['EndDate']+' '+Vaccinate.Events[i]['EndTime']);
							$('#modal-event-detail-ical').on('click', function(){
								cal.download();
							});
						} else {
							// If this is not a single day event...
							var endDate = Vaccinate.mdyToDate(Vaccinate.Events[i]['EndDate']),
								formattedEndDate = Vaccinate.intToDayName(endDate.getUTCDay())+', '+Vaccinate.intToMonthName(endDate.getUTCMonth())+' '+endDate.getUTCDate()+', '+endDate.getUTCFullYear();
							body += ' to '+formattedEndDate;
						}
						body += '</p>';
						$('#modal-event-detail-body').html(body);
						$('#modal-event-detail').modal('show');
					}
				})(Vaccinate.Marker, Vaccinate.i));
			}
		});
		/*
		Listen for clicks on the Search button in the header
		 */
		$('#search').on('click', function(){
			$('#modal-search-title').html(Vaccinate.Configs.Modal.search.title);
			$('#modal-search-body-instructions').html(Vaccinate.Configs.Modal.search.instructions);
			$('#modal-search').modal('show');
		});
		/*
		Listen to the Search Modal's Search button
		 */
		$('#modal-search-search').on('click', function(){

		});
	},

	searchByDate: function(Date) {


	}

};

window.onload = Vaccinate.loadScript;