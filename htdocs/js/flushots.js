/**
 * @classDestription - Placeholder for Flu Shot application variables and functions.
 * @class - Flushot
 */
var Flushots = (function($) {
	var constructor = function(infoboxoptions){
		this.AddressMarker = null;
		
		// Now
		this.now = Date.parse('now');
		
		this.Events = [];
		
		// Can we geolocate?
		this.geolocate = navigator.geolocation;
		
		this.setIcal = function(Event)
		{
			return function(){
				$('#ical-'+Event.data.id).icalendar({
					start: new Date(Date._parse(Event.data.begin_date+' '+Event.data.begin_time)),
					end: new Date(Date._parse(Event.data.begin_date+' '+Event.data.end_time)),
					title: 'Get Your Flu Shot',
					summary: 'Get Your Flu Shot',
					description: Event.data.hours+" "+Event.data.cost+" Please remember to bring your" +
					" immunization/shot records with you.",
					location: Event.data.facility_name+' - '+Event.data.street1+' - '+Event.data.city+' '+Event.data.state+' '+Event.data.postal_code,
					iconSize: 16,
					sites: ['icalendar'],
					echoUrl: '//flushots.smartchicagoapps.org/ical.php'
				});
			};
		};

		this.chooseDate = function(Event)
		{
			return function() {
				$('#ical-'+Event.data.id).icalendar({
					start: new Date(Date.parse('today')),
					//end: new Date(Date.parse('today')),
					title: 'Get Your Flu Shot',
					summary: 'Get Your Flu Shot',
					description: Event.data.hours+" "+Event.data.cost+" Please remember to bring your" +
					" immunization/shot records with you.",
					location: Event.data.facility_name+' - '+Event.data.street1+' - '+Event.data.city+' '+Event.data.state+' '+Event.data.postal_code,
					iconSize: 16,
					sites: ['icalendar'],
					echoUrl: '//flushots.smartchicagoapps.org/ical.php'
				});
			};
		};
		
		this.getEvents = function(columns,rows,Map)
		{
			// Copy the flu shot data to the Event object
			for (var i in rows)
			{
				this.Events[i] = new Event();
				for(var j in columns)
				{
					var colname = columns[j];
					this.Events[i].data[colname] = rows[i][j];
				}
				// Create the Google LatLng object
				this.Events[i].latlng = new google.maps.LatLng(this.Events[i].data.latitude,this.Events[i].data.longitude);
				// Create the markers for each event
				var icon = 'img/red.png';
				if($.trim(this.Events[i].data.cost.toLowerCase()).search(/no cost/) > -1 && $.trim(this.Events[i].data.cost.toLowerCase()).length > 0)
				{
					icon = 'img/blue.png';
				}
				this.Events[i].marker = new google.maps.Marker({
					position: this.Events[i].latlng,
					map: Map.Map,
					icon:icon,
					shadow:'img/shadow.png',
					clickable:true
				});
				// Make the info box
				this.Events[i].infobox = new InfoBox(infoboxoptions);
			}

			for(var i in this.Events)
			{
				google.maps.event.addListener(this.Events[i].marker,'click',this.Events[i].openModal(this.Events[i]));
				// If it is a one-day event, add the ical link.
				if(this.Events[i].data.begin_date === this.Events[i].data.end_date)
				{
					google.maps.event.addListener(this.Events[i].infobox, 'domready', this.setIcal(this.Events[i]));
				}
				else
				{
					google.maps.event.addListener(this.Events[i].infobox, 'domready', this.chooseDate(this.Events[i]));
				}
			}
		};
		
		/**
		 * Set the address for a latlng
		 */
		this.codeLatLng = function(Latlng)
		{
			var Geocoder = new google.maps.Geocoder();
			Geocoder.geocode(
				{'latLng': Latlng},
				function(Results,Status)
				{
					if (Status == google.maps.GeocoderStatus.OK)
					{
						if (Results[0])
						{
							var formattedAddress = Results[0].formatted_address.split(',');
							$('#nav-address').val(formattedAddress[0]);
							
							// Mask the exact address before recording
							// Example: '1456 W Greenleaf Ave' becomes '1400 W Greenleaf Ave'
							var addarray = $.trim($('#nav-address').val()).split(' ');
							// Chicago addresses start with numbers. So look for them and mask them.
							if(addarray[0].match(/^[0-9]+$/) !== null)
							{
								var replacement = addarray[0].substr(0,addarray[0].length-2)+'00';
								if(replacement !== '00')
								{
									addarray[0] = replacement;
								}
								else
								{
									addarray[0] = '0';
								}
							}
							var maskedAddress = addarray.join(' ');
							_gaq.push(['_trackEvent', 'Find Me', 'Address', maskedAddress]);
						}
						else
						{
							alert('We\'re sorry. We could not find an address for this location.');
						}
					}
					else
					{
						alert('We\'re sorry. We could not find an address for this location.');
					}
				}
			);
		};
		
		// Put a Pan/Zoom control on the map
		this.setFindMeControl = function(controlDiv,Map,Flu,Default)
		{
			// Set CSS styles for the DIV containing the control
			// Setting padding to 5 px will offset the control
			// from the edge of the map.
			controlDiv.style.padding = '1em';
			// Set CSS for the control border.
			var controlUI = document.createElement('div');
			controlUI.style.backgroundColor = '#11a2d2';
			//controlUI.style.backgroundColor = '#13b5ea'; // CDPH color
			controlUI.style.color = '#0d7ea3';
			controlUI.style.borderStyle = 'solid';
			controlUI.style.borderWidth = '1px';
			controlUI.style.cursor = 'pointer';
			controlUI.style.textAlign = 'center';
			controlUI.style.borderRadius = '6px';
			controlUI.title = 'Click to find your location.';
			controlDiv.appendChild(controlUI);
			// Set CSS for the control interior.
			var controlText = document.createElement('div');
			controlText.style.fontFamily = '"Helvetica Neue",Helvetica,Arial,sans-serif';
			controlText.style.fontSize = '14px';
			controlText.style.color = '#fff';
			controlText.style.paddingLeft = '.6em';
			controlText.style.paddingRight = '.6em';
			controlText.style.paddingTop = '.4em';
			controlText.style.paddingBottom = '.4em';
			controlText.innerHTML = 'Find Me';
			controlUI.appendChild(controlText);
			// Setup the click event listeners.
			google.maps.event.addDomListener(controlUI, 'click', function() {
				if(navigator.geolocation)
				{
					navigator.geolocation.getCurrentPosition(
						// Success
						function(position)
						{
							//_gaq.push(['_trackEvent', 'GPS', 'Success']);
							var Latlng = new google.maps.LatLng(
								position.coords.latitude,
								position.coords.longitude
							);
							Map.Map.setCenter(Latlng);
							Map.Map.setZoom(Default.zoomaddress);
							// Make a map marker if none exists yet
							if(Flu.AddressMarker === null)
							{
								Flu.AddressMarker = new google.maps.Marker({
									position:Latlng,
									map: Map.Map,
									icon:Default.iconlocation,
									clickable:false
								});
							}
							else
							{
								// Move the marker to the new location
								Flu.AddressMarker.setPosition(Latlng);
								// If the marker is hidden, unhide it
								if(Flu.AddressMarker.getMap() === null)
								{
									Flu.AddressMarker.setMap(Map.Map);
								}
							}
							Flu.codeLatLng(Latlng);
						},
						// Failure
						function()
						{
							alert('We\'re sorry. We could not find you. Please type in an address.');
						},
						{
							timeout:5000,
							enableHighAccuracy:true
						}
					);
				}
			});
		};
		
		this.setMapLegend = function(controlDiv,Map,Flu,Default)
		{
			// Set CSS styles for the DIV containing the control
			// Setting padding to 5 px will offset the control
			// from the edge of the map.
			controlDiv.style.padding = '1em';
			// Set CSS for the control border.
			var controlUI = document.createElement('div');
			controlUI.style.backgroundColor = 'rgb(255,255,255)';
			controlUI.style.color = '#333';
			controlUI.style.borderStyle = 'solid';
			controlUI.style.borderWidth = '1px';
			controlUI.style.cursor = 'pointer';
			controlUI.style.textAlign = 'center';
			controlUI.style.borderRadius = '6px';
			//controlUI.title = 'Click to learn more.';
			controlDiv.appendChild(controlUI);
			// Set CSS for the control interior.
			var controlText = document.createElement('div');
			controlText.style.fontFamily = '"Helvetica Neue",Helvetica,Arial,sans-serif';
			controlText.style.fontSize = '14px';
			controlText.style.color = '#333';
			controlText.style.paddingLeft = '.6em';
			controlText.style.paddingRight = '.6em';
			controlText.style.paddingTop = '.4em';
			controlText.style.paddingBottom = '.4em';
			controlText.innerHTML = '<div><a class="map-legend" data-toggle="modal" href="#modal-fee">No Cost To You</a><img src="img/blue.png" /></div>';
			controlUI.appendChild(controlText);
		};

		this.setMapSocial = function(controlDiv,Map,Flu,Default)
		{
			// Set CSS styles for the DIV containing the control
			// Setting padding to 5 px will offset the control
			// from the edge of the map.
			controlDiv.style.padding = '0.5em';
			// Set CSS for the control border.
			var controlUI = document.createElement('div');
			controlUI.style.backgroundColor = 'rgba(255,255,255,0)';
			controlUI.style.color = '#333';
			controlUI.style.borderStyle = 'solid';
			controlUI.style.borderWidth = '0px';
			controlUI.style.cursor = 'pointer';
			controlUI.style.textAlign = 'center';
			controlUI.style.borderRadius = '0px';
			//controlUI.title = 'Click to learn more.';
			controlDiv.appendChild(controlUI);
			// Set CSS for the control interior.
			var controlText = document.createElement('div');
			controlText.style.fontFamily = '"Helvetica Neue",Helvetica,Arial,sans-serif';
			controlText.style.fontSize = '14px';
			controlText.style.color = '#333';
			controlText.style.paddingLeft = '.0em';
			controlText.style.paddingRight = '.0em';
			controlText.style.paddingTop = '.0em';
			controlText.style.paddingBottom = '.0em';
			controlText.innerHTML = '<a class="twitter-share-button" href="https://twitter.com/intent/tweet?text=Get%20a%20flu%20shot.&url=http:%3A%2F%2Fchicagoflushots.org%2F&hashtags=FluChicago"></a><br><div class="fb-share-button" data-href="http://chicagoflushots.org/" data-layout="button"' +
				' style="margin-left:-20px; margin-top:10px;"></div>';
			controlUI.appendChild(controlText);
		};
		
		this.setMarkersByDay = function(day)
		{
			for(var i in this.Events)
			{
				// Let's see if 'day' is in the day of week list for this event.
				var dayArray = this.Events[i].data.recurrence_days.split(',');
				var onDay = false;
				for(var j in dayArray)
				{
					if (
						$.trim(day.toLowerCase()) === 'all'
						||
						(
							// If 'today'
							$.trim(day.toLowerCase()) === 'today'
							&& Date.getDayNumberFromName(this.now.toString('dddd')) === Date.getDayNumberFromName($.trim(dayArray[j]))
						)
						||
						(
							// If a day of the week
							Date.getDayNumberFromName(day) === Date.getDayNumberFromName($.trim(dayArray[j]))
						)
					)
					{
						onDay = true;
					}
				}
				// If event is after begin date and before end date, and is in the list of days of the week...
				if (
					// If 'day' is in the recurrence days list.
					onDay === true
					&& (
						// When 'day is a day of week, don't worry if event has not begun. 
						// We are looking for today as well as future events.
						$.trim(day.toLowerCase()) !== 'today'
						// Make sure today is on of after event start date.
						|| parseInt(this.now.toString('yyyyMMdd'),10) >= parseInt(Date.parse(this.Events[i].data.begin_date).toString('yyyyMMdd'),10)
					)
					// If today is before or on event end date
					&& parseInt(this.now.toString('yyyyMMdd'),10) <= parseInt(Date.parse(this.Events[i].data.end_date).toString('yyyyMMdd'),10)
				)
				{
					// See if it is a free event
					if($.trim(this.Events[i].data.cost.toLowerCase()).search(/no cost/) > -1 && $.trim(this.Events[i].data.cost.toLowerCase()).length > 0)
					{
						this.Events[i].marker.setIcon('img/blue.png');
					}
					else
					{
						// Hand over some dead presidents.
						this.Events[i].marker.setIcon('img/red.png');
					}
				}
				else if
				(
					$.trim(day.toLowerCase()) === 'seven'
					&& onDay === false
					// If today is before or on event end date
					&& (
						(
							// Event end date is on or after today & event end date is before or is 7 days from now
							parseInt(Date.parse(this.Events[i].data.end_date).toString('yyyyMMdd'),10) >= parseInt(Date.today().toString('yyyyMMdd'),10)
							&& parseInt(Date.parse(this.Events[i].data.end_date).toString('yyyyMMdd'),10) <= parseInt(Date.today().add({days:6}).toString('yyyyMMdd'),10)
						)
						||
						(
							// 
							(
								// Event begin date is before or on today & event end date is after or on today
								parseInt(Date.parse(this.Events[i].data.begin_date).toString('yyyyMMdd'),10) <= parseInt(Date.today().toString('yyyyMMdd'),10)
								&& parseInt(Date.parse(this.Events[i].data.end_date).toString('yyyyMMdd'),10) >= parseInt(Date.today().toString('yyyyMMdd'),10)
							)
							||
							(
								// event begin date is on or before 7 days from now & event end date is on or after today
								parseInt(Date.parse(this.Events[i].data.begin_date).toString('yyyyMMdd'),10) <= parseInt(Date.today().add({days:6}).toString('yyyyMMdd'),10)
								&& parseInt(Date.parse(this.Events[i].data.end_date).toString('yyyyMMdd'),10)  >= parseInt(Date.today().add({days:6}).toString('yyyyMMdd'),10)
							)
						)
					)
				)
				{
					// See if it is a free event
					if($.trim(this.Events[i].data.cost.toLowerCase()).search(/no cost/) > -1 && $.trim(this.Events[i].data.cost.toLowerCase()).length > 0)
					{
						this.Events[i].marker.setIcon('img/blue.png');
					}
					else
					{
						// Hand over some dead presidents.
						this.Events[i].marker.setIcon('img/red.png');
					}
				}
				else
				{
					this.Events[i].marker.setIcon('img/grey-transparent.png');
				}
			}
		};
	};
	return constructor;
})(jQuery);