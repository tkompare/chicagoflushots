function initMap() {
	let Default = {
		center: {
			lat: 41.875,
			lng: -87.6425
		},
		// Map Style from: https://snazzymaps.com/style/24358/blue
		styles: [
			{
				"featureType": "all",
				"elementType": "all",
				"stylers": [
					{
						"hue": "#075290"
					}
				]
			},
			{
				"featureType": "poi",
				"elementType": "all",
				"stylers": [
					{
						"visibility": "off"
					}
				]
			},
			{
				"featureType": "road",
				"elementType": "all",
				"stylers": [
					{
						"saturation": "0"
					},
					{
						"lightness": "0"
					}
				]
			},
			{
				"featureType": "transit",
				"elementType": "all",
				"stylers": [
					{
						"visibility": "off"
					}
				]
			},
			{
				"featureType": "water",
				"elementType": "all",
				"stylers": [
					{
						"visibility": "simplified"
					},
					{
						"saturation": "-60"
					},
					{
						"lightness": "-20"
					}
				]
			}
		]
	},
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
					let body = '<p>'+EventData['values'][i][0];
					if(EventData['values'][i][1].trim() !== ''){
						body += ' '+EventData['values'][i][1];
					}
					body += '<br>'+EventData['values'][i][2]+', '+EventData['values'][i][3]+' '+EventData['values'][i][4];
					let beginDate = mdyToDate(EventData['values'][i][10]),
						formattedBeginDate = intToDayName(beginDate.getUTCDay())+', '+intToMonthName(beginDate.getUTCMonth())+' '+beginDate.getUTCDate()+', '+beginDate.getUTCFullYear();
					body += '<hr>'+formattedBeginDate;
					// Is this a single day event?
					if(EventData['values'][i][10] === EventData['values'][i][11]) {
						body += '<hr>Hours: '+EventData['values'][i][12]+' to '+EventData['values'][i][13];
						// Make the ical! https://github.com/nwcell/ics.js
						let cal = new ics();
						cal.addEvent(EventData['values'][i][6], EventData['values'][i][18], EventData['values'][i][19], EventData['values'][i][10]+' '+EventData['values'][i][12], EventData['values'][i][11]+' '+EventData['values'][i][13]);
						$('#modal-event-detail-ical').on('click', function(){
							cal.download();
						});
					} else {
						let endDate = mdyToDate(EventData['values'][i][11]),
							formattedEndDate = intToDayName(endDate.getUTCDay())+', '+intToMonthName(endDate.getUTCMonth())+' '+endDate.getUTCDate()+', '+endDate.getUTCFullYear();
						body += ' to '+formattedEndDate;
					}
					body += '<p>';
					$('#modal-event-detail-body').html(body);
					$('#modal-event-detail').modal('show');
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