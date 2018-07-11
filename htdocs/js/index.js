function initMap() {
	let Default = {
		center: {
			lat: 41.875,
			lng: -87.6425
		},
		styles: [
			{
				"featureType": "poi.business",
				"stylers": [
					{
						"visibility": "off"
					}
				]
			},
			{
				"elementType": "geometry",
				"stylers": [
					{
						"color": "#ebe3cd"
					}
				]
			},
			{
				"elementType": "labels.text.fill",
				"stylers": [
					{
						"color": "#523735"
					}
				]
			},
			{
				"elementType": "labels.text.stroke",
				"stylers": [
					{
						"color": "#f5f1e6"
					}
				]
			},
			{
				"featureType": "administrative",
				"elementType": "geometry.stroke",
				"stylers": [
					{
						"color": "#c9b2a6"
					}
				]
			},
			{
				"featureType": "administrative.land_parcel",
				"elementType": "geometry.stroke",
				"stylers": [
					{
						"color": "#dcd2be"
					}
				]
			},
			{
				"featureType": "administrative.land_parcel",
				"elementType": "labels.text.fill",
				"stylers": [
					{
						"color": "#ae9e90"
					}
				]
			},
			{
				"featureType": "landscape.natural",
				"elementType": "geometry",
				"stylers": [
					{
						"color": "#dfd2ae"
					}
				]
			},
			{
				"featureType": "poi",
				"elementType": "geometry",
				"stylers": [
					{
						"color": "#dfd2ae"
					}
				]
			},
			{
				"featureType": "poi",
				"elementType": "labels.text.fill",
				"stylers": [
					{
						"color": "#93817c"
					}
				]
			},
			{
				"featureType": "poi.park",
				"elementType": "geometry.fill",
				"stylers": [
					{
						"color": "#a5b076"
					}
				]
			},
			{
				"featureType": "poi.park",
				"elementType": "labels.text.fill",
				"stylers": [
					{
						"color": "#447530"
					}
				]
			},
			{
				"featureType": "road",
				"elementType": "geometry",
				"stylers": [
					{
						"color": "#f5f1e6"
					}
				]
			},
			{
				"featureType": "road.arterial",
				"elementType": "geometry",
				"stylers": [
					{
						"color": "#fdfcf8"
					}
				]
			},
			{
				"featureType": "road.highway",
				"elementType": "geometry",
				"stylers": [
					{
						"color": "#f8c967"
					}
				]
			},
			{
				"featureType": "road.highway",
				"elementType": "geometry.stroke",
				"stylers": [
					{
						"color": "#e9bc62"
					}
				]
			},
			{
				"featureType": "road.highway.controlled_access",
				"elementType": "geometry",
				"stylers": [
					{
						"color": "#e98d58"
					}
				]
			},
			{
				"featureType": "road.highway.controlled_access",
				"elementType": "geometry.stroke",
				"stylers": [
					{
						"color": "#db8555"
					}
				]
			},
			{
				"featureType": "road.local",
				"elementType": "labels.text.fill",
				"stylers": [
					{
						"color": "#806b63"
					}
				]
			},
			{
				"featureType": "transit.line",
				"elementType": "geometry",
				"stylers": [
					{
						"color": "#dfd2ae"
					}
				]
			},
			{
				"featureType": "transit.line",
				"elementType": "labels.text.fill",
				"stylers": [
					{
						"color": "#8f7d77"
					}
				]
			},
			{
				"featureType": "transit.line",
				"elementType": "labels.text.stroke",
				"stylers": [
					{
						"color": "#ebe3cd"
					}
				]
			},
			{
				"featureType": "transit.station",
				"stylers": [
					{
						"visibility": "off"
					}
				]
			},
			{
				"featureType": "water",
				"elementType": "geometry.fill",
				"stylers": [
					{
						"color": "#b9d3c2"
					}
				]
			},
			{
				"featureType": "water",
				"elementType": "labels.text.fill",
				"stylers": [
					{
						"color": "#92998d"
					}
				]
			}
		]
	};

	let
		Map = new google.maps.Map(document.getElementById('map'), {
			zoom: 12,
			center: Default.center,
			styles: Default.styles,
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
		}),
		//infoWindow = new google.maps.InfoWindow(),
		marker,
		i;

	$.getJSON('https://sheets.googleapis.com/v4/spreadsheets/1_HTPvKSlLnWP__Lq_r-mCYKGcLau4Z7MmlsSyCMc454/values/Sheet1!A1:V?majorDimension=ROWS&key=AIzaSyAixqsNXzEBfYRAvx1aPVeNqDSR5bIfBeU', function(EventData) {

		for (i = 0; i < EventData['values'].length; i++) {
			marker = new google.maps.Marker({
				position: new google.maps.LatLng(EventData['values'][i][20], EventData['values'][i][21]),
				map: Map
			});

			google.maps.event.addListener(marker, 'click', (function(marker, i) {
				return function() {
					$('#modal-event-detail-title').html(EventData['values'][i][6]);
					// Is this a single day event?
					if(EventData['values'][i][10] === EventData['values'][i][11]) {
						let beginDate = mdyToDate(EventData['values'][i][10]);
						$('#modal-event-detail-body').html(
							"<p>"
							+intToDayName(beginDate.getUTCDay())+', '+intToMonthName(beginDate.getUTCMonth())+' '+beginDate.getUTCDate()+', '+beginDate.getUTCFullYear()
							+"</p>"
						);

					}
					$('#modal-event-detail').modal('show');

					// Make the ical! https://github.com/nwcell/ics.js
					let cal = new ics();
					cal.addEvent(EventData['values'][i][6], EventData['values'][i][18], EventData['values'][i][19], EventData['values'][i][10], EventData['values'][i][11]);
					cal.download();
				}
			})(marker, i));
		}

	});
}

function mdyToDate(mdy) {
	let mdyArray = mdy.split("/");
	return  new Date(mdyArray[2]+'-'+mdyArray[0]+'-'+mdyArray[1]);
}

function intToDayName(int) {
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
}

function intToMonthName(int) {
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
}