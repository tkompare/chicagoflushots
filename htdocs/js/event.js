/**
 * Event class
 */
var Event = (function($){
	var constructor = function()
	{
		this.data = {};
		this.latlng = null;
		this.marker = null;
		this.infobox = null;
		this.infoboxtext = null;
		
		// Oh dear lord, browser detection. -10 Charisma. Is the browser android or iPhone or Blackberry or Windows mobile?
		this.isPhone = (navigator.userAgent.match(/iPhone/i)
			|| (navigator.userAgent.toLowerCase().indexOf("android") > -1)
			|| (navigator.userAgent.toLowerCase().indexOf("blackberry") > -1)
			|| navigator.userAgent.match(/iemobile/i)
			|| navigator.userAgent.match(/Windows Phone/i)) ? true : false;

		this.toggleInfoBox = function(Map,ThisEvent)
		{
			return function(){
				if(ThisEvent.infobox.visible)
				{
					ThisEvent.infobox.close(Map,ThisEvent.marker);
				}
				else
				{
					ThisEvent.infoboxtext = '<div class="infoBox" style="border:2px solid rgb(16,16,16); margin-top:8px; background:#ddd; padding:5px; font-family:Helvetica Neue,Helvetica,Arial,sans-serif">';
					if(ThisEvent.data.url !== '') { ThisEvent.infoboxtext += '<a href="'+ThisEvent.data.url+'" target="_blank" style="color:#22f">More Information</a> | '; }
					//if(ThisEvent.data.url !== '' && (ThisEvent.data.begin_date === ThisEvent.data.end_date)) { ThisEvent.infoboxtext += ' | ';}
					ThisEvent.infoboxtext += '<span id="ical-'+ThisEvent.data.id+'" class="ical"></span>';
					ThisEvent.infoboxtext += '<br><span style="font-size:133%">'+ThisEvent.data.facility_name+'</span>';
					if(ThisEvent.data.begin_date === ThisEvent.data.end_date) { ThisEvent.infoboxtext += '<br>'+ThisEvent.data.recurrence_days; }
					if(ThisEvent.data.begin_date === ThisEvent.data.end_date) { ThisEvent.infoboxtext += '<br>'+ThisEvent.data.begin_date; }
					if(ThisEvent.data.begin_date === ThisEvent.data.end_date)
					{
						ThisEvent.infoboxtext += '<br>'+Date.parse(ThisEvent.data.begin_time).toString('h:mm tt').toLowerCase()+' - '+Date.parse(ThisEvent.data.end_time).toString('h:mm tt').toLowerCase();
					}
					else
					{
						ThisEvent.infoboxtext += '<br>'+ThisEvent.data.hours;
					}
					ThisEvent.infoboxtext += '<br>Cost: '+ThisEvent.data.cost;
					ThisEvent.infoboxtext += '<br>'+ThisEvent.data.street1;
					if(ThisEvent.data.street2 !== '') { ThisEvent.infoboxtext += '<br>'+ThisEvent.data.street2; }
					ThisEvent.infoboxtext += '<br>'+ThisEvent.data.city+', '+ThisEvent.data.state+' '+ThisEvent.data.postal_code;
					if(ThisEvent.data.contact !== '') { ThisEvent.infoboxtext += '<br>Contact: '+ThisEvent.data.contact; }
					if(ThisEvent.data.phone !== '') { 
						if(ThisEvent.isPhone === false)
						{
							ThisEvent.infoboxtext += '<br>'+ThisEvent.data.phone;
						}
						else
						{
							var phone = String(ThisEvent.data.phone).replace(/[^0-9]/g,'');
							ThisEvent.infoboxtext += '<br><a href="tel:+1'+phone.slice(-10)+'" style="color:#22f">&#x260E; <u>'+phone.slice(-10,-7)+'-'+phone.slice(-7,-4)+'-'+phone.slice(-4)+'</u></a>';
						}
					}
					ThisEvent.infoboxtext += '<br><a class="directions" href="http://www.google.com/maps?';
					if($('#nav-address').val() !== '')
					{
						ThisEvent.infoboxtext += 'saddr='+$('#nav-address').val()+' Chicago, IL&';
					}
					ThisEvent.infoboxtext += 'daddr='+ThisEvent.data.street1+' '+ThisEvent.data.city+', '+ThisEvent.data.state+' '+ThisEvent.data.postal_code+'" target="_blank" style="color:#22f">Get Directions</a>';
					ThisEvent.infoboxtext += '</div>';
					ThisEvent.infobox.setContent(ThisEvent.infoboxtext);
					ThisEvent.infobox.open(Map,ThisEvent.marker);
					_gaq.push(['_trackEvent', 'Open InfoBox', 'Event', ThisEvent.data.facility_name+' | '+ThisEvent.data.street1]);
				}
			};
		};
		
		this.closeInfoBox = function(Map,Marker,InfoBox)
		{
			if(InfoBox.visible)
			{
				InfoBox.close(Map,Marker);
			}
		};
		
	};
	return constructor;
})(jQuery);