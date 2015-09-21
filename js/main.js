(function($,TkMap,FusionTable,Flushots){
	/**
	 * @classDescription - Default settings for this application
	 * @class - Default
	 */
	var Default = {
		// City
		city:'Chicago',
		// DOM ID of where the Google Map is to be rendered
		domid:'map',
		// Google Fusion Tables SQL-like query string for flu shot location data
		eventquery:'SELECT * FROM 1leqPq9hrsGhnE8NoT00YZn1ITTzhK6BhrF8LNL4',
		// Google Fusion Tables URI
		fturl:'https://www.googleapis.com/fusiontables/v1/query',
		// Google maps API key
		googlemapsapikey:'AIzaSyDRVus9kkg8mr6M7EZUmXZsdoM7JSFbvC8',
		// Icon for other for-fee events
		iconfee:'/img/red.png',
		// Icon for Free events
		iconfree:'/img/blue.png',
		// Icon for your location
		iconlocation:'/img/yellow-dot.png',
		// infobox.js options
		infoboxoptions:{
			disableAutoPan: false,
			maxWidth: 0,
			pixelOffset: new google.maps.Size(-121, 0),
			zIndex: null,
			boxStyle: {
				background: "url('img/tipbox.gif') no-repeat",
				opacity: 0.92,
				width: "240px"
			},
			closeBoxMargin: "11px 4px 4px 4px",
			closeBoxURL: "img/close_x.png",
			infoBoxClearance: new google.maps.Size(25, 60),
			visible: false,
			pane: "floatPane",
			enableEventPropagation: false
		},
		// Start center latutude of the Google map
		lat:41.875,
		// Start center longitude of the Google map
		lng:-87.6425,
		// State
		state:'Illinois',
		// Defined style types passed to TkMap
		styles:'grey minlabels',
		// Initial zoom level for the Google map
		zoom:12,
		// Zoom for finding address
		zoomaddress:14
	};
	
	/* 
	 * jQuery's 'on document ready' function
	 * Run this after the DOM is fully loaded.
	 */
	$(function(){
		/**
		 * @classDescription - Construct the Map object
		 * @class - Map
		 */
		var Map = new TkMap({
			domid:Default.domid,
			init:true,
			lat:Default.lat,
			lng:Default.lng,
			styles:Default.styles,
			zoom:Default.zoom
		}); // END Map object constructor
		
		/**
		 * The Flushot application object
		 */
		var Flu = new Flushots(Default.infoboxoptions);
		
		var LegendDiv = document.createElement('div');
		Flu.setMapLegend(LegendDiv,Map,Flu,Default);
		LegendDiv.index = 1;
		Map.Map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(LegendDiv);

		var SocialDiv = document.createElement('div');
		Flu.setMapSocial(SocialDiv);
		SocialDiv.index = 1;
		Map.Map.controls[google.maps.ControlPosition.LEFT_TOP].push(SocialDiv);

		
		if(Flu.geolocate)
		{
			var FindMeDiv = document.createElement('div');
			Flu.setFindMeControl(FindMeDiv,Map,Flu,Default);
			FindMeDiv.index = 1;
			Map.Map.controls[google.maps.ControlPosition.TOP_RIGHT].push(FindMeDiv);
		}
		
		// Get the flu shot event data from the Google Fusion Table
		var EventsFT = new FusionTable(Default.fturl,Default.eventquery,Default.googlemapsapikey);
		$.getJSON(EventsFT.url, {
			dataType: 'jsonp',
			timeout: 5000
		})
		.done(function (ftdata) {
			EventsFT.columns = ftdata.columns;
			EventsFT.rows = ftdata.rows;
			Flu.getEvents(EventsFT.columns,EventsFT.rows,Map);
			// Highlight all today's and upcoming events.
			Flu.setMarkersByDay('all');
		})
		.fail(function(){
			alert('Oh, no! We are having trouble getting the information we need from storage.');
		});
		
		$('#nav-all').click(function(){
			
			// Change the UI
			$('#nav-li-days,#nav-li-seven,.day-btn').removeClass('active');
			$('#nav-li-all').addClass('active');
			$('#nav-days-text').text('On A Day');
			if($('#navbar-button').is(':visible'))
			{
				$('#navbar-button').click();
			}
			
			// Selected today's events
			Flu.setMarkersByDay('all');
			
		}); // END Day dropup listener
		
		// Seven Day listener
		$('#nav-seven').click(function(){
			
			// Change the UI
			$('#nav-li-days,#nav-li-all,.day-btn').removeClass('active');
			$('#nav-li-seven').addClass('active');
			$('#nav-days-text').text('On A Day');
			if($('#navbar-button').is(':visible'))
			{
				$('#navbar-button').click();
			}
			
			// Selected today's events
			Flu.setMarkersByDay('seven');
			
		}); // END 7 day listener
		
		/*
		 * The Day dropup list listener
		 */
		$('.day').click(function(){
			
			// Change the UI
			$('#nav-li-all,#nav-li-seven').removeClass('active');
			$('#nav-li-days').addClass('active');
			$('#nav-days-text').text($(this).text());
			if($('#navbar-button').is(':visible'))
			{
				$('#navbar-button').click();
			}
			
			// Select the day's events
			Flu.setMarkersByDay($(this).text());
			
		}); // END Day dropup listener
		
		$('#nav-address').change(function(){
			if($(this).val().length === 0)
			{
				if(Flu.AddressMarker !== null)
				{
					Flu.AddressMarker.setMap(null);
				}
			}
		});
		
		// Go button listener
		$('#nav-go').click(function(){
			$('#nav-address').blur();
			if($('#nav-address').val().length > 0)
			{
				var Geocoder = new google.maps.Geocoder();
				Geocoder.geocode(
					{
						address:$('#nav-address').val()+', '+Default.city+', '+Default.state
					},
					// Google returned a status
					function(Results, Status)
					{
						// Google returned an OK status
						if (Status == google.maps.GeocoderStatus.OK)
						{
							// Google returned a location
							if (Results[0])
							{
								Map.Map.panTo(Results[0].geometry.location);
								Map.Map.setZoom(Default.zoomaddress);
								// Make a map marker if none exists yet
								if(Flu.AddressMarker === null)
								{
									Flu.AddressMarker = new google.maps.Marker({
										position:Results[0].geometry.location,
										map: Map.Map,
										icon:Default.iconlocation,
										clickable:false
									});
								}
								else
								{
									// Move the marker to the new location
									Flu.AddressMarker.setPosition(Results[0].geometry.location);
									// If the marker is hidden, unhide it
									if(Flu.AddressMarker.getMap() === null)
									{
										Flu.AddressMarker.setMap(Map.Map);
									}
								}
								if($('#navbar-button').is(':visible'))
								{
									$('#navbar-button').click();
								}
								
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
								_gaq.push(['_trackEvent', 'Go Button', 'Address', maskedAddress]);
								
							}
							else
							{
								// Google didn't return a location
								alert('Sorry! We couldn\'t find that address.');
							}
						}
						else
						{
							// Google didn't return an OK status
							alert('Sorry! We couldn\'t find that address.');
						}
					}
				);
			}
			else
			{
				// Dude. The 'nav-address' input is empty
				alert('Please enter a '+Default.city+' street address in the box next to the "Go" button in the bottom navigation bar.');
			}
		}); // END Go button listener
		
		// Listen for clicks on "directions" links in the location pop-ups.
		$('body').on('click','.directions',function(){
			var theurl = 'http://www.google.com/maps?';
			if($('#nav-address').val() !== '')
			{
				theurl += 'saddr='+$('#nav-address').val()+' '+Default.city+', '+Default.state+'&';
			}
			theurl += 'daddr='+this.Events[i].data.street1+' '+this.Events[i].data.city+', '+this.Events[i].data.state+' '+this.Events[i].data.postal_code;
			window.open(theurl);
		});

		// Twitter & Facebook stuff
		google.maps.event.addListenerOnce(Map.Map, 'idle', function() {

			(function(d, s, id) {
				var js, fjs = d.getElementsByTagName(s)[0];
				if (d.getElementById(id)) return;
				js = d.createElement(s); js.id = id;
				js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.4&appId=329548300474690";
				fjs.parentNode.insertBefore(js, fjs);
			}(document, 'script', 'facebook-jssdk'));

			window.twttr = (function (d, s, id) {
				var js, fjs = d.getElementsByTagName(s)[0],
					t = window.twttr || {};
				if (d.getElementById(id)) return t;
				js = d.createElement(s);
				js.id = id;
				js.src = "http://platform.twitter.com/widgets.js";
				fjs.parentNode.insertBefore(js, fjs);

				t._e = [];
				t.ready = function (f) {
					t._e.push(f);
				};

				return t;
			}(document, "script", "twitter-wjs"));
		});
		
	}); // END jQuery on document ready
})(jQuery,TkMap,FusionTable,Flushots);