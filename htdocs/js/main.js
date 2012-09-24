$(document).ready(function()
{
	var touch = Modernizr.touch;
	var gps = navigator.geolocation;
	var defaultLat = 41.85;
	var defaultLng = -87.675;
	var locationLatLng = {};
	var locationMarker = null;
	var Circle = null;
	var lastFluShotLocationClicked = null;
	var DirectionsService = new google.maps.DirectionsService();
	var RendererOptions = {};
	// Render the map
	var Map = new TkMap({
		domid:'map',
		init:true,
		lat:defaultLat,
		lng:defaultLng,
		styles:'grey',
		zoom:12
	});
	// Get today's date
	var d = new Date();
	var date = d.getDate();
	//Months are zero based
	var month = d.getMonth() + 1;
	var year = d.getFullYear();
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
		tableid:'5171986',
		where:defaultWhere
	});
	fluShotLayerListener();
	/*
	 * Tooltips
	 */
	var placement = 'left';
	if(window.innerWidth > 760)
	{
		placement = 'bottom';
	}
	/*---------------------------------------------------------------------------
	 * FUNCTIONS
	 *--------------------------------------------------------------------------*/
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
			$('#icalr').html('<small class="text-info">Calendar Reminder For This Event</small>');
			$('#ical').icalendar(
				{
					start: startDate,
					end: endDate,
					title: 'CDPH Free Flu Shot Event',
					summary: 'CDPH Free Flu Shot Event',
					description: description,
					location: location,
					icons: 'img/icalendar.png',
					sites: ['google','yahoo']
				}
			);
			$('.icalendar_compact').css('border','0px');
			$('#ical-file').icalendar(
				{
					start: startDate,
					end: endDate,
					title: 'CDPH Free Flu Shot Event',
					summary: 'CDPH Free Flu Shot Event',
					description: description,
					location: location,
					icons: 'img/icalendar.png',
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
		google.maps.event.addListener(FluShotsLayer.Layer, "click", function(e) {
			lastFluShotLocationClicked = e.row;
			var DateArray = lastFluShotLocationClicked.Date.value.split('/');
			var HoursArray = lastFluShotLocationClicked.Hours.value.split(' - ');
			var sTime = HoursArray[0].split(':');
			var eTime = HoursArray[1].split(':');
			var sPM = sTime[1].match(/PM/i);
			if(sPM !== null && sTime[0] != 12)
			{
				sTime[0] = parseInt(sTime[0],10) + 12;
			}
			var ePM = eTime[1].match(/PM/i);
			if(ePM !== null && eTime != 12)
			{
				eTime[0] = parseInt(eTime[0],10) + 12;
			}
			var sMinute = sTime[1].split(' ');
			var eMinute = eTime[1].split(' ');
			var startDate = new Date(DateArray[2], DateArray[0]-1, DateArray[1], sTime[0], sMinute[0], 00);
			var endDate = new Date(DateArray[2], DateArray[0]-1, DateArray[1], eTime[0], eMinute[0], 00);
			setIcal(startDate,endDate,lastFluShotLocationClicked.Name.value,lastFluShotLocationClicked.Location.value);
			$('#eventselected').html('<b>'+lastFluShotLocationClicked.Name.value+'</b>');
			if(typeof locationLatLng.lat !== 'undefined')
			{
				$('#grp-cta').show();
			}
		});
	}
	/**
	 * Put a pan/zoom button on the Google map
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
		controlText.style.fontFamily = 'Arial,sans-serif';
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
	function setLocation()
	{
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode(
			{address:$('#location').val()},
			function(results,status)
			{
				if (status == google.maps.GeocoderStatus.OK)
				{
					if (results[0])
					{
						Map.Map.panTo(results[0].geometry.location);
						locationLatLng.lat = results[0].geometry.location.lat();
						locationLatLng.lng = results[0].geometry.location.lng();
						if(locationMarker !== null)
						{
							locationMarker.setMap(null);
						}
						locationMarker = new google.maps.Marker({
							position:results[0].geometry.location,
							map: Map.Map
						});
						$('#grp-find').show(0);
						if(lastFluShotLocationClicked !== null)
						{
							$('#grp-cta').show();
						}
					}
					else
					{
						alert("We're sorry. We could not locate this address. Please doublecheck your address and make sure to include your city, state and zip code.");
					}
				}
				else
				{
					alert("We're sorry. We could not locate this address. Please doublecheck your address and make sure to include your city, state and zip code.");
				}
			}
		);
	}
	function setLocationQuery()
	{
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode(
			{address:$('#location').val()},
			function(results, status)
			{
				if (status == google.maps.GeocoderStatus.OK)
				{
					if (results[0])
					{
						Map.Map.panTo(results[0].geometry.location);
						locationLatLng.lat = results[0].geometry.location.lat();
						locationLatLng.lng = results[0].geometry.location.lng();
						if(locationMarker !== null)
						{
							locationMarker.setMap(null);
						}
						locationMarker = new google.maps.Marker({
							position:results[0].geometry.location,
							map: Map.Map
						});
						var where = defaultWhere+' AND ST_INTERSECTS(Location, CIRCLE(LATLNG('+locationLatLng.lat+','+locationLatLng.lng+'), 5000))';
						var center = new google.maps.LatLng(locationLatLng.lat,locationLatLng.lng);
						Circle = new google.maps.Circle({
							center:center,
							clickable:false,
							fillOpacity:0.10,
							map:Map.Map,
							radius:5000,
							strokeWeight:2
						});
						Map.Map.panToBounds(Circle.getBounds());
						Map.Map.fitBounds(Circle.getBounds());
						FluShotsLayer.showLayer({where:where});
						fluShotLayerListener();
					}
					else
					{
						alert("We're sorry. We could not locate this address. Please doublecheck your address and make sure to include your city, state and zip code.");
					}
				}
				else
				{
					alert("We're sorry. We could not locate this address. Please doublecheck your address and make sure to include your city, state and zip code.");
				}
			}
		);
	}
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
	function findWeek()
	{
		var where = "Date >= '"+year +'.'+ (month<=9?'0'+month:month) +'.'+ (date<=9?'0'+date:date)+"'";
		where = where+" AND Date <= '"+year7 +'.'+ (month7<=9?'0'+month7:month7) +'.'+ (date7<=9?'0'+date7:date7)+"'";
		FluShotsLayer.showLayer({where:where});
		fluShotLayerListener();
	}
	/*
	 * No GPS?
	 */
	function handleNoGeolocation(errorFlag)
	{
		if (errorFlag)
		{
			$('#gpsfail').text('Error: The Geolocation service failed.');
			$('#alert-gpsfail').removeClass('hide');
		}
		else
		{
			$('#gpsfail').text('Error: Your browser doesn\'t support geolocation.');
			$('#alert-gpsfail').removeClass('hide');
		}
	}
	/*
	 * The Geocoder function
	 */
	function codeLatLng(latlng,id)
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
						$('#'+id).val(results[0].formatted_address);
						if(lastFluShotLocationClicked !== null)
						{
							$('#grp-cta').show();
						}
					}
					else
					{
						alert("We're sorry. We could not locate you. Please make sure your device's locator is working properly or you've clicked on the map at an addressable location.");
					}
				}
				else
				{
					alert("We're sorry. We could not locate you. Please make sure your device's locator is working properly or you've clicked on the map at an addressable location.");
				}
			}
		);
	}
	// Test for GPS
	if(gps)
	{
		$('.btn-gps').removeClass('hide');
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
	else
	{
//	Map.setPanZoom(true);
//	Map.setTouchScroll(false);
		RendererOptions = {
			draggable: true,
			suppressInfoWindows: true,
			suppressMarkers : false,
			polylineOptions: {
				strokeColor:'#0954cf',
				strokeWeight:'5',
				strokeOpacity: '0.85'
			}
		};
	}
	var DirectionsRenderer = new google.maps.DirectionsRenderer(RendererOptions);
	/************************************
	 * LISTENERS
	 ***********************************/
	/*
	 * Location listener
	 */
	$('#location').keyup(function(theKey){
		if($('#location').val().length > 0)
		{
			if (theKey.which == 13) {
				setLocation();
			}
		}
		else
		{
			$('#grp-find').hide(0);
		}
	});
	/*
	 * Location search button listener
	 */
	$('.cta').click(function()
	{
		var buttonClicked = $(this).attr('id');
		var transitOptions = {};
		if(buttonClicked == 'ctarouteevent')
		{
			var time = lastFluShotLocationClicked.Hours.value.split(' - ');
			if(time[0] == '12:00 PM')
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
			origin : $('#location').val(),
			destination : lastFluShotLocationClicked.Location.value,
			transitOptions : transitOptions,
			travelMode: google.maps.TravelMode.TRANSIT
		};
		DirectionsService.route(RouteRequest, function(Response, Status)
		{
			if (Status == google.maps.DirectionsStatus.OK)
			{
				$('#theform').hide(500);
				$('#span-cta').show(500);
				delete Response.routes[0].warnings;
				Response.routes[0].copyrights = '';
				$('#directions').html();
				$('#timetoleave').html();
				DirectionsRenderer.setDirections(Response);
				if(buttonClicked == 'ctarouteevent')
				{
					$('#timetoleave').html('<p class="lead">CTA/Metra Directions<br><b>Leave by '+Response.routes[0].legs[0].departure_time.text+' on '+lastFluShotLocationClicked.Date.value+'</b></p>');
				}
				else
				{
					$('#timetoleave').html('<p class="lead">CTA/Metra Directions<br><b>Leave by '+Response.routes[0].legs[0].departure_time.text+'</b></p>');
				}
			}
			else
			{
				if(typeof DirectionsRenderer !== 'undefined')
				{
					DirectionsRenderer.setMap(null);
				}
				$('#theform').hide(500);
				$('#span-cta').show(500);
				$('#timetoleave').html('<p class="lead">CTA/Metra Directions</p>');
				$('#directions').html('<p><b>We are sorry. We cannot route you to this clinic.</b> It is likely that the CTA or Metra has not released schedule times for the date of your travel yet. Please check back soon.</p>');
			}
		});
		fluShotLayerListener();
	});
	$('#btn-by-loc').click(function(){
		$('#grp-day').hide(500);
		$('.day').removeClass('marked active');
		$('#grp-location').show(500);
		setQuery();
	});
	/*
	 * Day search button listener
	 */
	$('#btn-by-day').click(function(){
		$('#grp-day').show(500);
	});
	/*
	 * Search button listener
	 */
	$('.search').click(function(){
		if($(this).attr('id') == 'search')
		{
			if(locationMarker !== null)
			{
				locationMarker.setMap(null);
			}
			if(Circle !== null)
			{
				Circle.setMap(null);
			}
			$('#grp-day').hide(500);
			$('.day').removeClass('marked active');
			setLocationQuery();
		}
		else
		{
			if($(this).hasClass('marked'))
			{
				$(this).removeClass('marked');
			}
			else
			{
				$(this).addClass('marked');
			}
			setQuery();
		}
	});
	/*
	 * Next 7 Days button listener
	 */
	$('#week').click(function() {
		$('.day').removeClass('active');
		$('#grp-day').hide(500);
		$('#btn-date-all').removeClass('active');
		$('#btn-date-available').addClass('active');
		findWeek();
	});
	$('#reset-map').click(function() {
		$('.day').removeClass('active marked');
		$('#grp-day').hide(500);
		$('#grp-find').hide(500);
		$('#grp-cta').hide(500);
		$('#location').val('');
		locationLatLng = {};
		lastFluShotLocationClicked = null;
		setQuery();
		if(locationMarker !== null)
		{
			locationMarker.setMap(null);
		}
		if(Circle !== null)
		{
			Circle.setMap(null);
		}
		if(typeof DirectionsRenderer !== 'undefined')
		{
			DirectionsRenderer.setMap(null);
		}
		$('#theform').show(500);
		$('#span-cta').hide(500);
		$('#timetoleave').html('');
		$('#directions').html('');
		$('#gen-info').show();
		Map.Map.setZoom(11);
		var latlng = new google.maps.LatLng(defaultLat,defaultLng);
		Map.Map.panTo(latlng);
	});
	/*
	 * GPS listener
	 */
	$('.btn-gps').click(function(){
		if(gps)
		{
			var thisArray = this.id.split('-');
			navigator.geolocation.getCurrentPosition(
				function(position)
				{
					pos = new google.maps.LatLng(
						position.coords.latitude,
						position.coords.longitude
					);
					$('#grp-find').show(0);
					Map.Map.panTo(pos);
					codeLatLng(pos,thisArray[2]);
					if(thisArray[2] == 'location')
					{
						locationLatLng.lat = position.coords.latitude;
						locationLatLng.lng = position.coords.longitude;
						var thisLatLng = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
						if(locationMarker !== null)
						{
							locationMarker.setMap(null);
						}
						locationMarker = new google.maps.Marker({
							position: thisLatLng,
							map: Map.Map
						});
					}
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
	/*
	 * Map Button listener
	 * If a map button is clicked, set a listener on the map for a click and fill
	 * in the associated address input.
	 */
	$('.btn-map').click(function(){
		var thisButton = $(this).attr('id');
		google.maps.event.clearListeners(Map.Map, 'click');
		var domobject = thisButton.split('-')[2];
		$('#grp-'+domobject).addClass('error');
		$('#'+domobject).val('');
		$('#'+domobject).attr('placeholder','Click the map at your location');
		google.maps.event.addListenerOnce(Map.Map, 'click', function(event){
			pos = new google.maps.LatLng(
				event.latLng.lat(),
				event.latLng.lng()
			);
			Map.Map.panTo(pos);
			codeLatLng(pos,domobject);
			if(domobject == 'location')
			{
				locationLatLng.lat = event.latLng.lat();
				locationLatLng.lng = event.latLng.lng();
				var thisLatLng = new google.maps.LatLng(event.latLng.lat(),event.latLng.lng());
				if(locationMarker !== null)
				{
					locationMarker.setMap(null);
				}
				locationMarker = new google.maps.Marker({
					position: thisLatLng,
					map: Map.Map
				});
			}
			$('#grp-'+domobject).removeClass('error');
			$('#'+domobject).attr('placeholder','123 W StreetName, City, State, ZipCode');
			$('#grp-find').show(0);
			fluShotLayerListener();
		});
	});
	$('#location').focusout(function(){
		if($('#location').val().length > 0)
		{
			setLocation();
		}
	});
});