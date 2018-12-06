var Vax = {
	Configs: null,
	Events: [],
	Cal: [],
	Map: null,
	Markers: [],
	AddressMarker: null,
	i: null, // iterator

	loadScript: function() {
		$.when(
			/*
			 * Get the configuration for the application from the configuration JSON file.
			 */
			$.getJSON("js/configure.json", function(configs) {
				Vax.Configs = configs;
			})
		).then(function(){
			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = 'https://maps.googleapis.com/maps/api/js?key='+Vax.Configs.Data.Google.key+'&' +
				'callback=Vax.initialize';
			document.body.appendChild(script);
		});
	},

	initialize: function(){
		if(Vax.Configs.Source === 'Google') {
			$.when(
					$.getJSON('https://sheets.googleapis.com/v4/spreadsheets/'+Vax.Configs.Data.Google.sheet.id+'/values/'+Vax.Configs.Data.Google.sheet.values+'?majorDimension='+Vax.Configs.Data.Google.sheet.majorDimension+'&key='+Vax.Configs.Data.Google.key, function(events) {
						// Use map/reduce to transform Sheet data to an array of objects using the first 'row' to define properties
						var keys = events.values.shift();
						Vax.Events = events.values.map(function(values) {
							return keys.reduce(function(object, key, i) {
								object[key] = values[i];
								return object;
							}, {});
						});
						Vax.setMoment();
					})
			).then(Vax.setMap);
		} else if (Vax.Configs.Source === 'CityOfChicago') {
			$.when(
					$.getJSON(Vax.Configs.Data.CityOfChicago.url, function(events){
						// Translate City of Chicago value names to standard value names.
						for (var i = 0; i < events.length; i++) {
							var keys = Object.keys(Vax.Configs.Data.CityOfChicago.alias);
							for (var j = 0; j < keys.length; j++) {
								if(i === 0) {
									console.log(keys[j]);
								}
								if(events[i][Vax.Configs.Data.CityOfChicago.alias[keys[j]]] === undefined) {
									events[i][keys[j]] = '';
								} else if (keys[j] === 'BeginDate' || keys[j] === 'EndDate') {
									events[i][keys[j]] = moment(events[i][Vax.Configs.Data.CityOfChicago.alias[keys[j]]]).format('M/D/YYYY');
								} else if (keys[j] === 'BeginTime' || keys[j] === 'EndTime') {
									events[i][keys[j]] = moment(events[i][Vax.Configs.Data.CityOfChicago.alias[keys[j]]], 'HH:mm:ss').format('h:mm:ss A');
								} else {
									events[i][keys[j]] = events[i][Vax.Configs.Data.CityOfChicago.alias[keys[j]]];
								}
							}
							if(i === 0) {
								console.log(events[i]);
							}
						}
						Vax.Events = events;
						Vax.setMoment();
					})
			).then(Vax.setMap);
		} else {
			$('#modal-error-title').html(Vax.Configs.Modal.errordata.title);
			$('#modal-error-body-instructions').html(Vax.Configs.Modal.errordata.instructions);
			$('#modal-error').modal('show');
			/*
			 Google Analytics - Record Event
			 */
			gtag('event', 'Error', {
				'event_label': 'Error-Data',
				'event_category': 'Error no valid data source.'
			});
		}

		/*
		Set the brand
		 */
		$('#header-brand').text(Vax.Configs.Brand.header);
		if(Vax.Configs.Brand.footerURL === '') {
			$('#footer-brand').text(Vax.Configs.Brand.footer);
		} else {
			$('#footer-brand').html('<a id="footer-brand-link" href="'+Vax.Configs.Brand.footerURL+'" target="_blank">'+Vax.Configs.Brand.footer+"</a>");
		}

		/*
		Listen for the Help button in the header
		 */
		$('#help').on('click', function() {
			$('#modal-help-title').html(Vax.Configs.Modal.help.title);
			$('#modal-help-body-instructions').html(Vax.Configs.Modal.help.instructions);
			$('#modal-help').modal('show');
			/*
			 Google Analytics - Record Event
			 */
			gtag('event', 'Button', {
				'event_label': 'Help',
				'event_category': 'Open help text'
			});
		});

		/*
		 Listen for the About button in the header
		 */
		$('#about').on('click', function() {
			$('#modal-about-title').html(Vax.Configs.Modal.about.title);
			$('#modal-about-body-instructions').html(Vax.Configs.Modal.about.instructions);
			$('#modal-about').modal('show');
			/*
			 Google Analytics - Record Event
			 */
			gtag('event', 'Button', {
				'event_label': 'About',
				'event_category': 'Open about text'
			});
		});

		/*
		Listen for clicks on the Search button in the header
		 */
		$('#search').on('click', function(){
			if($('#search').text() === 'Search'){
				$('#modal-search-title').html(Vax.Configs.Modal.search.title);
				$('#modal-search-body-instructions').html(Vax.Configs.Modal.search.instructions);
				$('#modal-search').modal('show');
				/*
				 Google Analytics - Record Event
				 */
				gtag('event', 'Button', {
					'event_label': 'Search',
					'event_category': 'Open search modal'
				});
			} else {
				/*
				 Google Analytics - Record Event
				 */
				gtag('event', 'Button', {
					'event_label': 'Reset',
					'event_category': 'Reset map markers'
				});
			}
			Vax.resetMarkers();
		});

		/*
		Listen to the Search Modal's Search buttons
		 */
		$('#modal-search-search').on('click', function(){
			if($('#modal-search-date').val() == '') {
				$('#modal-search-date').val(moment().format('ddd, LL'));
			}
			Vax.searchByDate(moment($('#modal-search-date').val(), 'ddd, LL'), null);
			/*
			 Google Analytics - Record Event
			 */
			gtag('event', 'Button', {
				'event_label': 'Search',
				'event_category': $('#modal-search-date').val()
			});
		});

		$('#modal-search-today').on('click', function() {
			var Today = moment(moment().format('L'), 'L'); // use format() to get start of day, not "now"
			$('#modal-search-date').val(Today.format('ddd, LL'));
			Vax.searchByDate(Today, null);
			/*
			 Google Analytics - Record Event
			 */
			gtag('event', 'Button', {
				'event_label': 'Search',
				'event_category': 'Today'
			});
		});

		$('#modal-search-tomorrow').on('click', function() {
			var Tomorrow = moment(moment().add(1, 'days').format('L'), 'L'); // use format() to get start of day
			$('#modal-search-date').val(Tomorrow.format('ddd, LL')); // use format() to get start of day
			Vax.searchByDate(Tomorrow, null);
			/*
			 Google Analytics - Record Event
			 */
			gtag('event', 'Button', {
				'event_label': 'Search',
				'event_category': 'Tomorrow'
			});
		});

		$('#modal-search-weekend').on('click', function() {
			var Saturday = moment(moment().isoWeekday('Saturday').format('L'), 'L'); // use format() to get start of day
			var Sunday = moment(moment().isoWeekday('Sunday').format('L'), 'L'); // use format() to get start of day
			$('#modal-search-date').val(Saturday.format('ddd, LL'));
			Vax.searchByDate(Saturday, Sunday);
			/*
			 Google Analytics - Record Event
			 */
			gtag('event', 'Button', {
				'event_label': 'Search',
				'event_category': 'Weekend'
			});
		});

		$('#modal-search-free').on('click', function() {
			for (var i = 0; i < Vax.Events.length; i++) {
				var highlighted = false;
				if(Vax.Events[i]['CostText'].indexOf('No cost') > -1) {
					highlighted = true;
				}
				if(highlighted === false) {
					Vax.Markers[i].setVisible(false);
				}
			}
			$('#search').html('Reset').removeClass('btn-custom').addClass('btn-danger');
			/*
			 Google Analytics - Record Event
			 */
			gtag('event', 'Button', {
				'event_label': 'Search',
				'event_category': 'Free Events'
			});
		});

		/*
			Listen for a click on the search date picker.
		 */
		$('#modal-search-date,#modal-search-date-append').datetimepicker({
			format: 'ddd, LL',
			//date: moment().format('ddd, LL'),
			ignoreReadonly: true
		});
	},

	setMoment: function() {
		// Create moment.js instances for Begin date&time, and End date&time
		for (var i = 0; i < Vax.Events.length; i++) {
			Vax.Events[i]['MomentBeginDate'] = moment(Vax.Events[i]['BeginDate'], 'l');
			Vax.Events[i]['MomentEndDate'] = moment(Vax.Events[i]['EndDate'], 'l');
			Vax.Events[i]['MomentBeginTime'] = moment(Vax.Events[i]['BeginTime'], 'h:mm:ss A');
			Vax.Events[i]['MomentEndTime'] = moment(Vax.Events[i]['EndTime'], 'h:mm:ss A');
		}
	},

	setMap: function(){
		Vax.Map = new google.maps.Map(document.getElementById('map'), {
			zoom: Vax.Configs.Map.zoom,
			center: Vax.Configs.Map.center,
			styles: Vax.Configs.Map.styles,
			clickableIcons: Vax.Configs.Map.clickableIcons,
			mapTypeControl: Vax.Configs.Map.mapTypeControl,
			panControl: Vax.Configs.Map.panControl,
			streetViewControl: Vax.Configs.Map.streetViewControl,
			zoomControl: Vax.Configs.Map.zoomControl,
			maxZoom: Vax.Configs.Map.maxZoom,
			minZoom: Vax.Configs.Map.minZoom,
			zoomControlOptions: {
				"position": google.maps.ControlPosition.RIGHT_TOP
			},
			fullscreenControl: Vax.Configs.Map.fullscreenControl
		});

		for (Vax.i = 0; Vax.i < Vax.Events.length; Vax.i++) {
			// if the event is in the past...
			if(Vax.Events[Vax.i]['MomentEndDate'].isBefore(moment())){
				Vax.Markers[Vax.i] = new google.maps.Marker({
					position: new google.maps.LatLng(Vax.Events[Vax.i]['Latitude'], Vax.Events[Vax.i]['Longitude']),
					map: Vax.Map,
					icon: {
						url: 'img/grey.png',
						scaledSize: new google.maps.Size(32, 32)
					},
					opacity: .67
				});
				// if the event is "No cost"...
			} else if(Vax.Events[Vax.i]['CostText'].indexOf('No cost') > -1) {
				Vax.Markers[Vax.i] = new google.maps.Marker({
					position: new google.maps.LatLng(Vax.Events[Vax.i]['Latitude'], Vax.Events[Vax.i]['Longitude']),
					map: Vax.Map,
					icon: {
						url: 'img/red.png',

						scaledSize: new google.maps.Size(32, 32)
					}
				});
				// if the event is not "no cost"...
			} else {
				Vax.Markers[Vax.i] = new google.maps.Marker({
					position: new google.maps.LatLng(Vax.Events[Vax.i]['Latitude'], Vax.Events[Vax.i]['Longitude']),
					map: Vax.Map,
					icon: {
						url: 'img/blue.png',
						scaledSize: new google.maps.Size(32, 32)
					}
				});
			}
			google.maps.event.addListener(Vax.Markers[Vax.i], 'click', (function(marker, i) {
				return function() {
					$('#modal-event-detail-title').html(Vax.Events[i]['LocationName']);
					var body = '';
					if(Vax.Events[i]['MomentEndDate'].isBefore(moment())){
						body += '<div class="alert alert-danger" role="alert">This date of this event has passed. Look for red or blue event pins on the map.</div>';
					}
					body += '<p>'+Vax.Events[i]['Address1'];
					if(Vax.Events[i]['Address2'].trim() !== ''){
						body += ' '+Vax.Events[i]['Address2'];
					}
					body += '<br>'+Vax.Events[i]['City']+', '+Vax.Events[i]['State']+' '+Vax.Events[i]['PostalCode'];
					if(Vax.Events[i]['Phone'] !== '' || Vax.Events[i]['Contact'] !== '') {
						body += '<br>';
						if(Vax.Events[i]['Contact'] !== '') {
							body += 'Contact: '+Vax.Events[i]['Contact'];
						}
						if(Vax.Events[i]['Phone'] !== '' && Vax.Events[i]['Contact'] !== '') {
							body += ' at ';
						}
						if(Vax.Events[i]['Phone'] !== '') {
							body += Vax.Events[i]['Phone'];
						}
					}
					if(Vax.Events[i]['Url'] !== '') {
						body += '<br><a href="'+Vax.Events[i]['Url']+'" target="_blank">'+Vax.Events[i]['Url']+'</a>';
					}
					// If this is single day event...
					if(Vax.Events[i]['BeginDate'] === Vax.Events[i]['EndDate']) {
						body += '<hr>'+Vax.Events[i]["MomentBeginDate"].format('dddd, MMMM Do, YYYY');
						body += '<br>Hours: '+Vax.Events[i]["MomentBeginTime"].format('h:mm A')+' to '+Vax.Events[i]["MomentEndTime"].format('h:mm A');

						// Make the ical! https://github.com/nwcell/ics.js
						Vax.Cal[i] = ics();
						Vax.Cal[i].addEvent(
								Vax.Events[i]['LocationName'],
								Vax.Events[i]['CostText']+' '+Vax.Events[i]['Contact']+' '+Vax.Events[i]['Phone']+' '+Vax.Events[i]['Url'],
								Vax.Events[i]['Address1']+' '+Vax.Events[i]['Address2']+' '+Vax.Events[i]['City']+', '+Vax.Events[i]['State']+' '+Vax.Events[i]['PostalCode'],
								Vax.Events[i]['MomentBeginDate'].format('M/D/YYYY')+' '+Vax.Events[i]['MomentBeginTime'].format('h:mm a'),
								Vax.Events[i]['MomentEndDate'].format('M/D/YYYY')+' '+Vax.Events[i]['MomentEndTime'].format('h:mm a')
						);

						$('#modal-event-detail-ical').show().on('click', function(){
							Vax.Cal[i].download();
							/*
							 Google Analytics - Record Event
							 */
							gtag('event', 'Button', {
								'event_label': 'Add To Calendar',
								'event_category': Vax.Events[i]['LocationName']+' - '+Vax.Events[i]['MomentBeginDate'].format('M/D/YYYY')
							});

							$('#modal-event-detail-ical').off();
						});
					} else {
						// not a single day event...
						body += '<hr>'+Vax.Events[i]['HoursText'];
						$('#modal-event-detail-ical').hide().off();
					}
					$('#modal-event-detail-directions').on('click', function(){
						/*
						 Google Analytics - Record Event
						 */
						gtag('event', 'Button', {
							'event_label': 'Directions',
							'event_category': Vax.Events[i]['LocationName']+' - '+Vax.Events[i]['Address1']+' '+Vax.Events[i]['Address2']+' '+Vax.Events[i]['City']+', '+Vax.Events[i]['State']+' '+Vax.Events[i]['PostalCode']
						});
						window.open('https://maps.google.com/?q='+Vax.Events[i]['Address1']+' '+Vax.Events[i]['City']+', '+Vax.Events[i]['State']+' '+Vax.Events[i]['PostalCode']+' '+Vax.Events[i]['Country'], '_blank');
						$('#modal-event-detail-directions').off();
					});

					body += '<hr>'+Vax.Events[i]['CostText'];
					body += '</p>';
					$('#modal-event-detail-body').html(body);
					$('#modal-event-detail').modal('show');
					/*
					Google Analytics - Record Event
					 */
					gtag('event', 'Modal', {
						'event_label': 'Vaccination Detail',
						'event_category': Vax.Events[i]['LocationName']+' - '+Vax.Events[i]['Address1']+' '+Vax.Events[i]['Address2']+' '+Vax.Events[i]['City']+', '+Vax.Events[i]['State']+' '+Vax.Events[i]['PostalCode']
					});
				}
			})(Vax.Markers[Vax.i], Vax.i));
		}
		if(navigator.geolocation) {
			var FindMeDiv = document.createElement('div');
			Vax.setFindMeControl(FindMeDiv);
			FindMeDiv.index = 1;
			Vax.Map.controls[google.maps.ControlPosition.TOP_LEFT].push(FindMeDiv);
		}
	},

	setFindMeControl: function(controlDiv)
	{
		// Set CSS styles for the DIV containing the control
		// Setting padding to 5 px will offset the control
		// from the edge of the map.
		controlDiv.className += 'find-me-div';
		// Set CSS for the control border.
		var controlUI = document.createElement('div');
		controlUI.className += 'find-me-ui';
		controlUI.title = 'Click to find your location.';
		controlDiv.appendChild(controlUI);
		// Set CSS for the control interior.
		var controlText = document.createElement('div');
		controlText.className += 'find-me-text';
		controlText.innerHTML = 'Find Me';
		controlUI.appendChild(controlText);
		var Geocoder = new google.maps.Geocoder;
		// Setup the click event listeners.
		google.maps.event.addDomListener(controlUI, 'click', function() {
			if(navigator.geolocation)
			{
				navigator.geolocation.getCurrentPosition(
						// Success
						function(position)
						{
							var Latlng = new google.maps.LatLng(
									position.coords.latitude,
									position.coords.longitude
							);
							Geocoder.geocode({'location': Latlng}, function(results, status) {
								if (status === 'OK') {
									if(results instanceof Array) {
										for(var i=0; results[0].address_components.length; i++) {
											if(results[0].address_components[i].types.includes('postal_code')) {
												/*
												 Google Analytics - Record Event
												 */
												gtag('event', 'Button', {
													'event_label': 'Find Me',
													'event_category': results[0].address_components[i].short_name
												});
												break;
											}
										}
									}
								}
							});
							Vax.Map.setCenter(Latlng);
							Vax.Map.setZoom(Vax.Configs.Map.zoom);
							// Make a map marker if none exists yet
							if(Vax.AddressMarker === null)
							{
								Vax.AddressMarker = new google.maps.Marker({
									position:Latlng,
									map: Vax.Map,
									icon: {
										url: 'img/yellow.png',
										scaledSize: new google.maps.Size(32, 32)
									},
									clickable:false
								});
							}
							else
							{
								// Move the marker to the new location
								Vax.AddressMarker.setPosition(Latlng);
								// If the marker is hidden, unhide it
								if(Vax.AddressMarker.getMap() === null)
								{
									Vax.AddressMarker.setMap(Map.Map);
								}
							}
						},
						// Failure
						function()
						{
							$('#modal-error-title').html(Vax.Configs.Modal.errorlocate.title);
							$('#modal-error-body-instructions').html(Vax.Configs.Modal.errorlocate.instructions);
							$('#modal-error').modal('show');
							/*
							 Google Analytics - Record Event
							 */
							gtag('event', 'Error', {
								'event_label': 'Error-Data',
								'event_category': 'Error no valid data source.'
							});
						},
						{
							timeout:5000,
							enableHighAccuracy:true
						}
				);
			}
		});
	},

	searchByDate: function(searchDate,toDate) {
		for (Vax.i = 0; Vax.i < Vax.Events.length; Vax.i++) {
			var highlighted = false;
			var momentBeginDate = moment(Vax.Events[Vax.i]['BeginDate'], "l");
			var momentEndDate = moment(Vax.Events[Vax.i]['EndDate'], "l");
			if(searchDate.isBetween(momentBeginDate, momentEndDate, null, '[]')) {
				if(Vax.Events[Vax.i]['RecurrenceDays'].length === 0){
					highlighted = true;
				} else {
					var daysArray = Vax.Events[Vax.i]['RecurrenceDays'].split(',');
					for(var j=0; j<daysArray.length; j++) {
						if(Vax.matchDays(searchDate, daysArray[j].replace(/ /g,''))) {
							highlighted = true;
							break;
						}
					}
				}
			}
			if(highlighted === false && toDate !== null && toDate.isBetween(momentBeginDate, momentEndDate, null, '[]')) {
				if(Vax.Events[Vax.i]['RecurrenceDays'].length === 0) {
					highlighted = true;
				} else {
					var toDaysArray = Vax.Events[Vax.i]['RecurrenceDays'].split(',');
					for(var k=0; k<toDaysArray.length; k++) {
						if(Vax.matchDays(toDate, toDaysArray[k].replace(/ /g,''))) {
							highlighted = true;
							break;
						}
					}
				}
			}
			if(highlighted === false) {
				Vax.Markers[Vax.i].setVisible(false);
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
		for (Vax.i = 0; Vax.i < Vax.Events.length; Vax.i++) {
			Vax.Markers[Vax.i].setVisible(true);
		}
		$('#search').html('Search').removeClass('btn-danger').addClass('btn-custom');
		$('#modal-search-date').val('');
	}

};

window.onload = Vax.loadScript;