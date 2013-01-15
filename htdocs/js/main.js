function loadScript() {
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "http://maps.googleapis.com/maps/api/js?key=" + config["api_key"] + "&sensor=true&callback=initialize";
  document.body.appendChild(script);
}

window.onload = loadScript;

function initialize() {
	var touch = Modernizr.touch,
		gps = navigator.geolocation,
		locationMarker = null,
		eventSelected = false,
		Circle = null,
		lastFluShotLocationClicked = null;

	// If this is iframed, hide the footer.
	if (window.frames.length != parent.frames.length)
	{
		$('#footer').hide();
	}

	// Render the map
	var Map = new TkMap({
		domid:'map',
		init:true,
		lat:config["default_lat"],
		lng:config["default_lng"],
		styles:config["map_style"],
		zoom:config["initial_zoom"]
	});

	// Get today's date
	var d = new Date(),
		date = d.getDate(),
		month = d.getMonth() + 1, // zero-based
		year = d.getFullYear();

	// Get seven days from today
	var d7 = new Date(d);
	d7.setDate(d7.getDate()+7);
	var date7 = d7.getDate();

	//Months are zero based
	var month7 = d7.getMonth() + 1;
	var year7 = d7.getFullYear();

	// Google FT likes dot-based dates
	var defaultWhere = "Date >= '"+year +'.'+ (month<=9?'0'+month:month) +'.'+ (date<=9?'0'+date:date)+"'";
	
	// Render the Flu shot clinic locations on the map
	var FluShotsLayer = new TkMapFusionLayer({
		geo:'Location',
		map:Map.Map,
		tableid: config["table_id"],
		where:defaultWhere
	});
	var RendererOptions = {
		suppressInfoWindows: true,
		polylineOptions: {
			strokeColor:config["stroke_color"],
			strokeWeight:config["stroke_weight"],
			strokeOpacity: config["stroke_opacity"]
		}
	};
	// start up the google directions service and renderer
	var DirectionsService = new google.maps.DirectionsService();
	var DirectionsRenderer = new google.maps.DirectionsRenderer(RendererOptions);
	// Test for GPS
	if(gps)
	{
		$('#btn-gps-location').removeClass('hide');
	}
	// Test for touch to set pan/zoom default
	if (touch)
	{
		Map.setPanZoom(false);
		Map.setTouchScroll(true);
		// Set Pan/Zoom Control
		var PanZoomControlDiv = document.createElement('div');
		var panZoomControl = new PanZoomControl(PanZoomControlDiv, Map.Map);
		PanZoomControlDiv.index = 1;
		Map.Map.controls[google.maps.ControlPosition.TOP_RIGHT].push(PanZoomControlDiv);
	}
	// start listening for a click on the flu shot locations
	fluShotLayerListener();
	/*---------------------------------------------------------------------------
	 * FUNCTIONS
	 *--------------------------------------------------------------------------*/
	/**
	 * Set ical event reminder object
	 */
	function setIcal(startDate,endDate,description,location){
		if($('#ical').hasClass('hasICalendar'))
		{
			$('#ical').icalendar(
					'change',
					{
						start: startDate,
						end: endDate,
						description: description,
						location: location
					}
			);
			$('.icalendar_compact').css('border','0px');
			$('#ical-file').icalendar(
				'change',
				{
					start: startDate,
					end: endDate,
					description: description,
					location: location
				}
			);
		}
		else
		{
			$('#ical').icalendar(
				{
					start: startDate,
					end: endDate,
					title: config["cal_title"],
					summary: config["cal_summary"],
					description: description,
					location: location,
					iconSize: 0,
					sites: ['google','yahoo']
				}
			);
			$('.icalendar_compact').css('border','0px');
			$('#ical-file').icalendar(
				{
					start: startDate,
					end: endDate,
					title: config["cal_title"],
					summary: config["cal_summary"],
					description: description,
					location: location,
					iconSize: 0,
					sites: ['icalendar','outlook'],
					echoUrl: 'ical.php'
				}
			);
		}
	}
	/**
	 * Listen for a click on a flu shot clinic location
	 * and retrieve the data from the FT.
	 */
	function fluShotLayerListener() {
		google.maps.event.addListener(FluShotsLayer.Layer, "click", function(event) {
			lastFluShotLocationClicked = event.row;
			var DateArray = lastFluShotLocationClicked.Date.value.split('/');
			lastFluShotLocationClicked.Hours.value.replace(/\s/g, '');
			var HoursArray = lastFluShotLocationClicked.Hours.value.split('-');
			var startTime = HoursArray[0].split(':');
			var endTime = HoursArray[1].split(':');
			var startPM = startTime[1].match(/PM/i);
			if(startPM !== null && startTime[0] != 12)
			{
				startTime[0] = parseInt(startTime[0],10) + 12;
			}
			var endPM = endTime[1].match(/PM/i);
			if(endPM !== null && endTime != 12)
			{
				endTime[0] = parseInt(endTime[0],10) + 12;
			}
			var startMinute = startTime[1].match(/^[0-9]{2}/);
			var endMinute = endTime[1].split(/^[0-9]{2}/);
			var startDate = new Date(DateArray[2], DateArray[0]-1, DateArray[1], startTime[0], startMinute[0], 00);
			var endDate = new Date(DateArray[2], DateArray[0]-1, DateArray[1], endTime[0], endMinute[0], 00);
			$('#grp-ical').show(500);
			setIcal(startDate,endDate,lastFluShotLocationClicked.Name.value,lastFluShotLocationClicked.Location.value);
			eventSelected = true;
			$('#eventselected').html('<b>'+lastFluShotLocationClicked.Name.value+'</b>');
			if(locationMarker !== null)
			{
				$('#grp-cta').show(750);
			}
			$('#grp-reset').show(750);
		});
	}
	/**
	 * Put an enable/disable pan/zoom button on the Google map
	 */
	function PanZoomControl(controlDiv, map) {
		// Set CSS styles for the DIV containing the control
		// Setting padding to 5 px will offset the control
		// from the edge of the map.
		controlDiv.style.padding = '5px';
		// Set CSS for the control border.
		var controlUI = document.createElement('div');
		controlUI.style.backgroundColor = 'white';
		controlUI.style.borderStyle = 'solid';
		controlUI.style.borderWidth = '2px';
		controlUI.style.cursor = 'pointer';
		controlUI.style.textAlign = 'center';
		controlUI.title = 'Click to set the map to Home';
		controlDiv.appendChild(controlUI);
		// Set CSS for the control interior.
		var controlText = document.createElement('div');
		controlText.style.fontFamily = 'sans-serif';
		controlText.style.fontSize = '12px';
		controlText.style.paddingLeft = '4px';
		controlText.style.paddingRight = '4px';
		controlText.innerHTML = 'Enable Pan/Zoom';
		controlUI.appendChild(controlText);
		// Setup the click event listeners.
		google.maps.event.addDomListener(controlUI, 'click', function() {
			if(Map.Map.zoomControl == false)
			{
				Map.setPanZoom(true);
				Map.setTouchScroll(false);
				controlText.innerHTML = 'Disable Pan/Zoom';
			}
			else
			{
				Map.setPanZoom(false);
				Map.setTouchScroll(true);
				controlText.innerHTML = 'Enable Pan/Zoom';
			}
		});
	}
	/**
	 * Find where the user is and put a map pin on it
	 */
	function setLocationQuery()
	{
		if(locationMarker !== null)
		{
			locationMarker.setMap(null);
		}
		if(Circle !== null)
		{
			Circle.setMap(null);
		}
		$('#grp-day').hide(750);
		$('.day').removeClass('marked active');
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode(
			{address:$('#location').val()+', ' + config["city"] + ', ' + config["state"]},
			function(results, status)
			{
				if (status == google.maps.GeocoderStatus.OK)
				{
					if (results[0])
					{
						Map.Map.panTo(results[0].geometry.location);
						placeMarker(results[0].geometry.location);
					}
					else
					{
						addressError();
					}
				}
				else
				{
					addressError();
				}
			}
		);
	}
	/**
	 * show an addressing error
	 */
	function addressError()
	{
		alert('We\'re sorry. We could not locate this address. Please doublecheck you\'ve entered your address correctly.');
	}
	/**
	 * Fun little query builder to find event by the days of the week the user clicked on.
	 */
	function setQuery()
	{
		var where = defaultWhere;
		if (
			$('#btn-day-su').hasClass('marked') ||
			$('#btn-day-mo').hasClass('marked') ||
			$('#btn-day-tu').hasClass('marked') ||
			$('#btn-day-we').hasClass('marked') ||
			$('#btn-day-th').hasClass('marked') ||
			$('#btn-day-fr').hasClass('marked') ||
			$('#btn-day-sa').hasClass('marked')
		)
		{
			where = where+" AND Day IN (";
			if($('#btn-day-su').hasClass('marked'))
			{
				where = where+"'Sunday',";
			}
			if($('#btn-day-mo').hasClass('marked'))
			{
				where = where+"'Monday',";
			}
			if($('#btn-day-tu').hasClass('marked'))
			{
				where = where+"'Tuesday',";
			}
			if($('#btn-day-we').hasClass('marked'))
			{
				where = where+"'Wednesday',";
			}
			if($('#btn-day-th').hasClass('marked'))
			{
				where = where+"'Thursday',";
			}
			if($('#btn-day-fr').hasClass('marked'))
			{
				where = where+"'Friday',";
			}
			if($('#btn-day-sa').hasClass('marked'))
			{
				where = where+"'Saturday',";
			}
			where = where.substring(0, where.length - 1);
			where = where+")";
		}
		FluShotsLayer.showLayer({where:where});
		fluShotLayerListener();
	}
	/**
	 * Find events in the next seven days
	 */
	function findWeek()
	{
		var where = "Date >= '"+year +'.'+ (month<=9?'0'+month:month) +'.'+ (date<=9?'0'+date:date)+"'";
		where = where+" AND Date <= '"+year7 +'.'+ (month7<=9?'0'+month7:month7) +'.'+ (date7<=9?'0'+date7:date7)+"'";
		FluShotsLayer.showLayer({where:where});
		fluShotLayerListener();
	}
	/**
	 * No GPS?
	 */
	function handleNoGeolocation(errorFlag)
	{
		if (errorFlag)
		{
			alert('We\'re sorry. Your browser\'s geolocation service failed.');
		}
		else
		{
			alert('We\'re sorry! Your browser does not support geolocation.');
		}
	}
	/**
	 * Put the marker on the map
	 */
	function placeMarker(latlng)
	{
		if(locationMarker !== null)
		{
			locationMarker.setMap(null);
		}
		if(Circle !== null)
		{
			Circle.setMap(null);
			Circle = null;
		}
		locationMarker = new google.maps.Marker({
			position:latlng,
			map: Map.Map
		});
		Circle = new google.maps.Circle({
			center:latlng,
			clickable:false,
			fillOpacity:0.075,
			map:Map.Map,
			radius:5000,
			strokeWeight:1
		});
		Map.Map.panToBounds(Circle.getBounds());
		Map.Map.fitBounds(Circle.getBounds());
		FluShotsLayer.showLayer({where:defaultWhere});
		fluShotLayerListener();
		$('#grp-find').show(750);
		$('#grp-reset').show();
		if(eventSelected === true)
		{
			$('#grp-cta').show(750);
		}
	}
	/**
	 * Find the address of a lat lng pair.
	 */
	function codeLatLng(latlng)
	{
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode(
			{'latLng': latlng},
			function(results, status)
			{
				if (status == google.maps.GeocoderStatus.OK)
				{
					if (results[1])
					{
						var formattedAddress = results[0].formatted_address.split(',');
						$('#location').val(formattedAddress[0]);
						$('#location').blur();
						if(lastFluShotLocationClicked !== null)
						{
							$('#grp-cta').show(750);
						}
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
	}
	/*---------------------------------------------------------------------------
	 * LISTENERS
	 *--------------------------------------------------------------------------*/
	/**
	 * Location listener
	 */
	$('#location').keyup(function(theKey){
		if($(this).val().length > 0)
		{
			if (theKey.which == 13) {
				setLocationQuery();
			}
		}
	});
	/**
	 * Listen for the route buttons
	 */
	$('.cta').click(function()
	{
		var buttonClicked = $(this).attr('id');
		var transitOptions = {};
		if(buttonClicked == 'ctarouteevent')
		{
			lastFluShotLocationClicked.Hours.value.replace(/\s/g, '');
			var time = lastFluShotLocationClicked.Hours.value.split('-');
			if($.trim(time[0]) == '12:00PM' || $.trim(time[0]) == '12:00 PM')
			{
				time[0] = '12:00';
			}
			var datetoparse = lastFluShotLocationClicked.Date.value+' '+time[0];
			var unixtime = Date.parse(datetoparse).getTime();
			transitOptions = {
				arrivalTime : new Date(unixtime)
			};
		}
		DirectionsRenderer.setMap(Map.Map);
		$('#directions').html('');
		DirectionsRenderer.setPanel(document.getElementById('directions'));
		var RouteRequest = {
			origin : $('#location').val()+', ' + config['city'] + ', ' + config['state'],
			destination : lastFluShotLocationClicked.Location.value,
			transitOptions : transitOptions,

			travelMode: google.maps.TravelMode.TRANSIT
		};
		DirectionsService.route(RouteRequest, function(Response, Status)
		{
			if (Status == google.maps.DirectionsStatus.OK)
			{
				$('#theform').hide(750);
				$('#span-cta').show(750);
				var transitroute = 0;
				for(var i=0; i<Response.routes.length; i++)
				{
					for(var j=0; j<Response.routes[i].legs[0].steps.length; j++)
					{
						if(Response.routes[i].legs[0].steps[j].travel_mode == 'TRANSIT')
						{
							transitroute = i;
							break;
						}
					}
					delete Response.routes[i].warnings;
					Response.routes[i].copyrights = '';
				}
				$('#directions').html();
				$('#timetoleave').html();
				DirectionsRenderer.setDirections(Response);
				if(buttonClicked == 'ctarouteevent')
				{
					$('#timetoleave').html('<b>Directions</b><br>Leave by '+Response.routes[transitroute].legs[0].departure_time.text+' on '+lastFluShotLocationClicked.Date.value+'</p>');
				}
				else
				{
					$('#timetoleave').html('<b>Directions</b><br>Leave by '+Response.routes[transitroute].legs[0].departure_time.text+'</p>');
				}
			}
			else
			{
				if(typeof DirectionsRenderer !== 'undefined')
				{
					DirectionsRenderer.setMap(null);
				}
				$('#theform').hide(750);
				$('#span-cta').show(750);
				$('#timetoleave').html('<p class="lead">Directions</p>');
				$('#directions').html('<p><b>We are sorry. We cannot route you to this clinic.</b> It is likely that your local transit authority has not released schedule times for the date of your travel yet. Please check back soon.</p>');
			}
		});
		fluShotLayerListener();
	});
	/**
	 * Day search button listener
	 */
	$('#btn-by-day').click(function(){
		$('#grp-day').show(750);
	});
	/**
	 * Search by days listener
	 */
	$('.search').click(function(){
		if($(this).hasClass('marked'))
		{
			$(this).removeClass('marked');
		}
		else
		{
			$(this).addClass('marked');
		}
		setQuery();
	});
	/**
	 * Next 7 Days button listener
	 */
	$('#week').click(function() {
		$('.day,#btn-date-all').removeClass('active');
		$('#grp-day').hide(750);
		$('#btn-date-available').addClass('active');
		findWeek();
	});
	/**
	 * Start over button
	 */
	$('#reset-map').click(function() {
		$('.day').removeClass('active marked');
		$('#grp-day,#grp-find,#grp-cta,#span-cta,#grp-ical,#grp-reset').hide(750);
		$('#ical,#ical-file,#eventselected,#timetoleave,#directions').html('');
		$('#location').val('');
		$('#theform').show(750);
		lastFluShotLocationClicked = null;
		setQuery();
		if(locationMarker !== null)
		{
			locationMarker.setMap(null);
			locationMarker = null;
		}
		if(Circle !== null)
		{
			Circle.setMap(null);
			Circle = null;
		}
		if(typeof DirectionsRenderer !== 'undefined')
		{
			DirectionsRenderer.setMap(null);
		}
		eventSelected = false;
		Map.Map.setZoom(11);
		var latlng = new google.maps.LatLng(defaultLat,defaultLng);
		Map.Map.panTo(latlng);
	});
	/**
	 * GPS listener
	 */
	$('#btn-gps-location').click(function(){
		if(gps)
		{
			navigator.geolocation.getCurrentPosition(
				function(position)
				{
					var pos = new google.maps.LatLng(
						position.coords.latitude,
						position.coords.longitude
					);
					Map.Map.panTo(pos);
					codeLatLng(pos);
					placeMarker(pos);
				},
				function()
				{
					handleNoGeolocation(true);
				}
			);
		}
		else
		{
			// Browser doesn't support Geolocation
			handleNoGeolocation(false);
		}
	});
	/**
	 * Address Search Button listener
	 */
	$('#btn-search-location').click(function(){
		if($('#location').val().length > 0)
		{
			setLocationQuery();
		}
	});
}