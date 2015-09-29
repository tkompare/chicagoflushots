/**
 * TkMap is a JS class to make it easy to place a Google Maps API map into a
 * given DOM object.
 * @param array Args
 * @type class
 */
var TkMap = (function($){
	var constructor = function(Args)
	{
		/*
		 * PROPERTIES ***************************************************************
		 */
		/*
		 * PRIVATE properties from Required Arguments
		 */
		/** Latitude in decimal degrees */
		var Lat = typeof Args.lat !== 'undefined' ? Args.lat : null;
		/** Longitude in decimal degrees */
		var Lng = typeof Args.lng !== 'undefined' ? Args.lng : null;
		/** The ID of the DOM object in which to place the map */
		var DomId = typeof Args.domid !== 'undefined' ? Args.domid : null;
		/*
		 * PRIVATE Properties from Optional Arguments
		 */
		/** Google Maps zoom level */
		var Zoom = typeof Args.zoom !== 'undefined' ? Args.zoom : 15;
		/** Show the map as soom as this map object is created */
		var Init = typeof Args.init !== 'undefined' ? Args.init : false;
		/** Set map zoom level according to map DOM size */
		var Responsive = typeof Args.responsive !== 'undefined' ? Args.responsive : false;
		/** Set built-in custom map styles */
		var Styles = typeof Args.styles !== 'undefined' ? Args.styles : null;
		/*
		 * Other PRIVATE Properties
		 */
		/** Google Maps map options */
		var MapOptions = {
				center : new google.maps.LatLng(Lat,Lng),
				draggable : true,
				mapTypeControl : false,
				mapTypeId : google.maps.MapTypeId.ROADMAP,
				panControl : false,
				streetViewControl : false,
				styles : [],
				zoom: Zoom,
				zoomControl : true
		};
		/*
		 * Variables used to control touch events
		 */
		/** Are we currently dragging? */
		var dragFlag = false;
		/** touchstart Y location */
		var touchstart = null;
		/** touchend Y location */
		var touchend = null;
		/*
		 * PUBLIC Properties
		 */
		/** The Google Map object */
		this.Map = null;
		/*
		 * METHODS ****************************************************************
		 */
		/*
		 * PRIVATE methods
		 */
		/** Begin calculation of vertical scroll on touchstart event */
		var touchStart =  function(e)
		{
			dragFlag = true;
			touchstart = e.touches[0].pageY;
		};
		/** End calculation of vertical scroll on touchend event */
		var touchEnd = function()
		{
			dragFlag = false;
		};
		/** Calculate vertical scroll on touchmove event */
		var touchMove = function(e)
		{
			if ( ! dragFlag){return;}
			touchend = e.touches[0].pageY;
			window.scrollBy(0,(touchstart - touchend ));
		};
		/** Choose pre-built map styles. */
		var setCustomStyles = function()
		{
			var StylesArray = Styles.split(' ');
			for (var i in StylesArray)
			{
				if(StylesArray[i] === 'satellite')
				{
					MapOptions.mapTypeId = google.maps.MapTypeId.SATELLITE;
				}
				else
				{
					if (StylesArray[i] === 'hybrid')
					{
						MapOptions.mapTypeId = google.maps.MapTypeId.HYBRID;
					}
					else if (StylesArray[i] === 'road')
					{
						MapOptions.mapTypeId = google.maps.MapTypeId.ROADMAP;
					}
					else if (StylesArray[i] === 'terrain')
					{
						MapOptions.mapTypeId = google.maps.MapTypeId.TERRAIN;
					}
					else if (StylesArray[i] === 'minlabels')
					{
						MapOptions.styles.push
						(
							{
								featureType : "all",
								elementType : "labels",
								stylers: [{ visibility: "off" }]
							},
							{
								featureType : "administrative",
								elementType : "labels",
								stylers: [{ visibility: "on" }]
							},
							{
								featureType : "road",
								elementType : "labels",
								stylers: [{ visibility: "on" }]
							}
						);
					}
					else if (StylesArray[i] === 'grey')
					{
						MapOptions.backgroundColor = '#C5C5C5';
						MapOptions.styles.push
						(
							{
								stylers: [{ saturation: -87 }]
							},
							{
								featureType: "road.arterial",
								elementType: "geometry",
								stylers: [{ lightness: 85 }]
							},
							{
								featureType: "water",
								stylers: [{ lightness: -20 }]
							}
						);
					}
				}
			}
		};
		/** Set map zoom level based on the map's DOM object width */
		var setResponsive = function()
		{
			/** The width of the map DOM object */
			var theWidth = $("#"+DomId).width();
			if(theWidth < 481)
			{
				MapOptions.zoom--;
			}
			else if (theWidth > 959)
			{
				MapOptions.zoom++;
			}
		};
		/*
		 * PUBLIC methods
		 */
		/** Place the map in the DOM object */
		this.initMap = function()
		{
			if (this.Map === null)
			{
				if (Styles !== null)
				{
					setCustomStyles();
				}
				if (Responsive)
				{
					setResponsive();
				}
				this.Map = new google.maps.Map(
					document.getElementById(DomId),
					MapOptions
				);
			}
		};
		/** Set more map options before map initializaton */
		this.setMapOptions = function(options)
		{
			if(this.Map !== null)
			{
				$.extend(MapOptions,options);
			}
		};
		/**
		 * Set the listeners for touch-scrolling the screen on the map.
		 * Generally used in conjunction with this.setPanZoom().
		 */
		this.setTouchScroll = function(TSBoolean)
		{
			var thisElement = document.getElementById(DomId);
			if(TSBoolean)
			{
				thisElement.addEventListener("touchstart", touchStart, true);
				thisElement.addEventListener("touchend", touchEnd, true);
				thisElement.addEventListener("touchmove", touchMove, true);
				this.Map.setOptions({
					zoomControl : false
				});
			}
			else
			{
				thisElement.removeEventListener("touchstart", touchStart, true);
				thisElement.removeEventListener("touchend", touchEnd, true);
				thisElement.removeEventListener("touchmove", touchMove, true);
				this.Map.setOptions({
				zoomControl: true,
				zoomControlOptions: {
					position : google.maps.ControlPosition.LEFT_TOP
				}
				});
			}
		};
		/**
		 * Turn on and off map's pan and zoom capabilities.
		 */
		this.setPanZoom = function(PZBoolean)
		{
			var dblclick;
			if(PZBoolean)
			{
				dblclick = false;
			}
			else
			{
				dblclick = true;
			}
			this.Map.setOptions({
				disableDoubleClickZoom : dblclick,
				draggable : PZBoolean,
				keyboardShortcuts : PZBoolean,
				scrollwheel : PZBoolean,
				zoomControl : PZBoolean
			});
		};
		/**
		 * CODE TO RUN AT INSTANTIATION *********************************************
		 */
		if(Init === true)
		{
			this.initMap();
		}
	};
	return constructor;
})(jQuery);