var Vaccinate = {

	Configs: null,
	Events: [],
	Map: null,
	Markers: [],
	i: null, // Events iterator
	svgTemplate: [
		'<?xml version="1.0"?>',
		'<svg aria-hidden="true" data-prefix="fas" data-icon="map-marker-alt" class="svg-inline--fa fa-map-marker-alt fa-w-12" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">',
		'<path class="map-marker-alt" fill="{{ color }}" d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"></path>',
		'</svg>'
	].join('\n'),
	svgDefault: null,
	svgHighlight: null,

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
			script.src = 'https://maps.googleapis.com/maps/api/js?key='+Vaccinate.Configs.Data.Google.key+'&' +
				'callback=Vaccinate.initialize';
			document.body.appendChild(script);
		});
	},

	initialize: function(){
		if(Vaccinate.Configs.Data.Source === 'Google') {
			$.when(
					$.getJSON('https://sheets.googleapis.com/v4/spreadsheets/'+Vaccinate.Configs.Data.Google.sheet.id+'/values/'+Vaccinate.Configs.Data.Google.sheet.values+'?majorDimension='+Vaccinate.Configs.Data.Google.sheet.majorDimension+'&key='+Vaccinate.Configs.Data.Google.key, function(events) {
						// Use map/reduce to transform Sheet data to an array of objects using the first 'row' to define properties
						var keys = events.values.shift();
						Vaccinate.Events = events.values.map(function(values) {
							return keys.reduce(function(object, key, i) {
								object[key] = values[i];
								return object;
							}, {});
						});
					})
			).then(Vaccinate.setMap);
		} else if (Vaccinate.Configs.Data.Source === 'CityOfChicago') {
			$.when(
					$.getJSON(Vaccinate.Configs.Data.CityOfChicago.url+'?$limit=5000', function(events){
						// Translate City of Chicago value names to standard value names.
						for (var i = 0; i < events.length; i++) {
							var keys = Object.keys(Vaccinate.Configs.Data.CityOfChicago.alias);
							for (var j = 0; j < keys.length; j++) {
								if(i === 256) {
								}
								if(events[i][Vaccinate.Configs.Data.CityOfChicago.alias[keys[j]]] === undefined) {
									events[i][keys[j]] = '';
								} else if (keys[j] === 'Latitude') {
									events[i][keys[j]] = events[i][Vaccinate.Configs.Data.CityOfChicago.alias[keys[j]]]['coordinates'][1];
								} else if (keys[j] === "Longitude") {
									events[i][keys[j]] = events[i][Vaccinate.Configs.Data.CityOfChicago.alias[keys[j]]]['coordinates'][0];
								} else if (keys[j] === 'BeginDate' || keys[j] === 'EndDate') {
									events[i][keys[j]] = moment(events[i][Vaccinate.Configs.Data.CityOfChicago.alias[keys[j]]]).format('M/D/YYYY');
								} else if (keys[j] === 'BeginTime' || keys[j] === 'EndTime') {
									if(i === 0) {
									}
									events[i][keys[j]] = moment(events[i][Vaccinate.Configs.Data.CityOfChicago.alias[keys[j]]], 'HH:mm:ss').format('h:mm:ss A');
								} else {
									events[i][keys[j]] = events[i][Vaccinate.Configs.Data.CityOfChicago.alias[keys[j]]];
								}
							}
						}
						Vaccinate.Events = events;
						// Create moment.js instances for Begin date&time, and End date&time
						for (Vaccinate.i = 0; Vaccinate.i < Vaccinate.Events.length; Vaccinate.i++) {
							Vaccinate.Events[Vaccinate.i]['MomentBeginDate'] = moment(Vaccinate.Events[Vaccinate.i]['BeginDate'], 'l');
							Vaccinate.Events[Vaccinate.i]['MomentEndDate'] = moment(Vaccinate.Events[Vaccinate.i]['EndDate'], 'l');
							Vaccinate.Events[Vaccinate.i]['MomentBeginTime'] = moment(Vaccinate.Events[Vaccinate.i]['BeginTime'], 'h:mm:ss A');
							Vaccinate.Events[Vaccinate.i]['MomentEndTime'] = moment(Vaccinate.Events[Vaccinate.i]['EndTime'], 'h:mm:ss A');
						}
					})
			).then(
					Vaccinate.setMap
			);
		} else {
			alert('No valid data source identified.');
		}
		/*
		Listen for clicks on the Search button in the header
		 */
		$('#search').on('click', function(){
			if($('#search').text() === 'Search'){
				$('#modal-search-title').html(Vaccinate.Configs.Modal.search.title);
				$('#modal-search-body-instructions').html(Vaccinate.Configs.Modal.search.instructions);
				$('#modal-search').modal('show');
			}
			Vaccinate.resetMarkers();
		});

		/*
		Listen to the Search Modal's Search buttons
		 */
		$('#modal-search-search').on('click', function(){
			Vaccinate.searchByDate(moment($('#modal-search-date').val(), 'ddd, LL'), null);
		});

		$('#modal-search-today').on('click', function() {
			var Today = moment(moment().format('L'), 'L'); // use format() to get start of day, not "now"
			$('#modal-search-date').val(Today.format('ddd, LL'));
			Vaccinate.searchByDate(Today, null);
		});

		$('#modal-search-tomorrow').on('click', function() {
			var Tomorrow = moment(moment().add(1, 'days').format('L'), 'L'); // use format() to get start of day
			$('#modal-search-date').val(Tomorrow.format('ddd, LL')); // use format() to get start of day
			Vaccinate.searchByDate(Tomorrow, null);
		});

		$('#modal-search-weekend').on('click', function() {
			var Saturday = moment(moment().isoWeekday('Saturday').format('L'), 'L'); // use format() to get start of day
			var Sunday = moment(moment().isoWeekday('Sunday').format('L'), 'L'); // use format() to get start of day
			$('#modal-search-date').val(Saturday.format('ddd, LL'));
			Vaccinate.searchByDate(Saturday, Sunday);
		});

		$('#modal-search-free').on('click', function() {
			for (Vaccinate.i = 0; Vaccinate.i < Vaccinate.Events.length; Vaccinate.i++) {
				var highlighted = false;
				if(Vaccinate.Events[Vaccinate.i]['CostText'].indexOf('No cost') > -1) {
					highlighted = true;
				}
				if(highlighted === false) {
					Vaccinate.Markers[Vaccinate.i].setVisible(false);
				}
			}
			$('#search').html('Reset').removeClass('btn-custom').addClass('btn-danger');
		});

		/*
			Listen for a click on the search date picker.
		 */
		$('#modal-search-date,#modal-search-date-append').datetimepicker({
			format: 'ddd, LL',
			date: moment().format('ddd, LL'),
			ignoreReadonly: true
		});
	},

	setMap: function(){
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

		Vaccinate.svgDefault = Vaccinate.svgTemplate.replace('{{ color }}', 'DarkBlue');
		Vaccinate.svgHighlight = Vaccinate.svgTemplate.replace('{{ color }}', 'Crimson');

		for (Vaccinate.i = 0; Vaccinate.i < Vaccinate.Events.length; Vaccinate.i++) {
			// if the event is in the past...
			if(Vaccinate.Events[Vaccinate.i]['MomentEndDate'].isBefore(moment())){
				Vaccinate.Markers[Vaccinate.i] = new google.maps.Marker({
					position: new google.maps.LatLng(Vaccinate.Events[Vaccinate.i]['Latitude'], Vaccinate.Events[Vaccinate.i]['Longitude']),
					map: Vaccinate.Map,
					icon: {
						url: 'img/grey.png',
						scaledSize: new google.maps.Size(32, 32)
					}
				});
				// if the event is "No cost"...
			} else if(Vaccinate.Events[Vaccinate.i]['CostText'].indexOf('No cost') > -1) {
				Vaccinate.Markers[Vaccinate.i] = new google.maps.Marker({
					position: new google.maps.LatLng(Vaccinate.Events[Vaccinate.i]['Latitude'], Vaccinate.Events[Vaccinate.i]['Longitude']),
					map: Vaccinate.Map,
					icon: {
						url: 'img/red.png',
						scaledSize: new google.maps.Size(32, 32)
					}
				});
				// if the event is not "no cost"...
			} else {
				Vaccinate.Markers[Vaccinate.i] = new google.maps.Marker({
					position: new google.maps.LatLng(Vaccinate.Events[Vaccinate.i]['Latitude'], Vaccinate.Events[Vaccinate.i]['Longitude']),
					map: Vaccinate.Map,
					icon: {
						url: 'img/blue.png',
						scaledSize: new google.maps.Size(32, 32)
					}
				});
			}
			google.maps.event.addListener(Vaccinate.Markers[Vaccinate.i], 'click', (function(marker, i) {
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
					var momentBeginDate = moment(Vaccinate.Events[i]['BeginDate'], "l");
					body += '<hr>'+momentBeginDate.format('dddd, MMMM Do, YYYY');
					// If this is single day event...
					if(Vaccinate.Events[i]['BeginDate'] === Vaccinate.Events[i]['EndDate']) {
						var momentBeginTime = moment(Vaccinate.Events[i]['BeginTime'], 'h:mm:ss A');
						var momentEndTime = moment(Vaccinate.Events[i]['EndTime'], 'h:mm:ss A');
						body += '<br>Hours: '+momentBeginTime.format('h:mm A')+' to '+momentEndTime.format('h:mm A');
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
						// not a single day event...
						var momentEndDate = moment(Vaccinate.Events[i]['EndDate'], "l");
						body += '<br>through '+momentEndDate.format('dddd, MMMM Do, YYYY');
						body += '<br>'+Vaccinate.Events[i]['HoursText'];
					}
					body += '<hr>'+Vaccinate.Events[i]['NotesText'];
					body += '</p>';
					$('#modal-event-detail-body').html(body);
					$('#modal-event-detail').modal('show');
				}
			})(Vaccinate.Markers[Vaccinate.i], Vaccinate.i));
		}
	},

	searchByDate: function(searchDate,toDate) {
		for (Vaccinate.i = 0; Vaccinate.i < Vaccinate.Events.length; Vaccinate.i++) {
			var highlighted = false;
			var momentBeginDate = moment(Vaccinate.Events[Vaccinate.i]['BeginDate'], "l");
			var momentEndDate = moment(Vaccinate.Events[Vaccinate.i]['EndDate'], "l");
			if(searchDate.isBetween(momentBeginDate, momentEndDate, null, '[]')) {
				if(Vaccinate.Events[Vaccinate.i]['RecurrenceDays'].length === 0){
					highlighted = true;
				} else {
					var daysArray = Vaccinate.Events[Vaccinate.i]['RecurrenceDays'].split(',');
					for(var j=0; j<daysArray.length; j++) {
						if(Vaccinate.matchDays(searchDate, daysArray[j].replace(/ /g,''))) {
							highlighted = true;
							break;
						}
					}
				}
			}
			if(highlighted === false && toDate !== null && toDate.isBetween(momentBeginDate, momentEndDate, null, '[]')) {
				if(Vaccinate.Events[Vaccinate.i]['RecurrenceDays'].length === 0) {
					highlighted = true;
				} else {
					var toDaysArray = Vaccinate.Events[Vaccinate.i]['RecurrenceDays'].split(',');
					for(var k=0; k<toDaysArray.length; k++) {
						if(Vaccinate.matchDays(toDate, toDaysArray[k].replace(/ /g,''))) {
							highlighted = true;
							break;
						}
					}
				}
			}
			if(highlighted === false) {
				Vaccinate.Markers[Vaccinate.i].setVisible(false);
			}
		}
		$('#search').html('Reset').removeClass('btn-custom').addClass('btn-danger');
	},

	matchDays: function(search, match){
		switch (match) {
			case search.format('dddd'):
			case search.format('ddd'):
			case search.format('dd'):
				return true;
			default:
				return false;
		}
	},

	resetMarkers: function() {
		for (Vaccinate.i = 0; Vaccinate.i < Vaccinate.Events.length; Vaccinate.i++) {
			Vaccinate.Markers[Vaccinate.i].setVisible(true);
		}
		$('#search').html('Search').removeClass('btn-danger').addClass('btn-custom');
	}

};

window.onload = Vaccinate.loadScript;