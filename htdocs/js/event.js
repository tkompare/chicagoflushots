/**
 * Event class
 */
var Event = (function($){
	var constructor = function()
	{
		this.data = {};
		this.latlng = null;
		this.marker = null;
		this.infoboxtext = null;
		
		// Oh dear lord, browser detection. -10 Charisma. Is the browser android or iPhone or Blackberry or Windows mobile?
		this.isPhone = (navigator.userAgent.match(/iPhone/i)
			|| (navigator.userAgent.toLowerCase().indexOf("android") > -1)
			|| (navigator.userAgent.toLowerCase().indexOf("blackberry") > -1)
			|| navigator.userAgent.match(/iemobile/i)
			|| navigator.userAgent.match(/Windows Phone/i)) ? true : false;

		this.openModal = function(ThisEvent)
		{
			return function(){
				ThisEvent.infoboxtext = '<p>';
				if(ThisEvent.data.begin_date === ThisEvent.data.end_date) {
					ThisEvent.infoboxtext += Date.parse(ThisEvent.data.begin_date).toString('dddd, MMMM d, yyyy');
					ThisEvent.infoboxtext += '<br>' + Date.parse(ThisEvent.data.begin_time).toString('h:mm tt').toLowerCase() + ' - ' + Date.parse(ThisEvent.data.end_time).toString('h:mm tt').toLowerCase();
				}
				else
				{
					ThisEvent.infoboxtext += ThisEvent.data.hours;
				}
				ThisEvent.infoboxtext += '</p><p>Cost: '+ThisEvent.data.cost+'</p><p>';
				ThisEvent.infoboxtext += ThisEvent.data.street1;
				if(ThisEvent.data.street2 !== '') { ThisEvent.infoboxtext += ', '+ThisEvent.data.street2; }
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
				ThisEvent.infoboxtext += '</p><a class="directions btn btn-default" href="http://www.google.com/maps?';
				if($('#nav-address').val() !== '')
				{
					ThisEvent.infoboxtext += 'saddr='+$('#nav-address').val()+' Chicago, IL&';
				}
				ThisEvent.infoboxtext += 'daddr='+ThisEvent.data.street1+' '+ThisEvent.data.city+', '+ThisEvent.data.state+' '+ThisEvent.data.postal_code+'" target="_blank">Get Directions</a>';
				if(ThisEvent.data.url !== '') {
					ThisEvent.infoboxtext += '<a href="'+ThisEvent.data.url+'" target="_blank" class="btn' +
						' btn-default">More Information</a>';
				}
				if(ThisEvent.data.begin_date === ThisEvent.data.end_date) {
					ThisEvent.infoboxtext += '<span id="ical-' + ThisEvent.data.id + '" class="ical"></span>';
				}

				$('#modal-event-title').text(ThisEvent.data.facility_name);
				$('#modal-body-span').html(ThisEvent.infoboxtext);

					$('#ical-'+ThisEvent.data.id).icalendar({
						start: new Date(Date._parse(ThisEvent.data.begin_date+' '+ThisEvent.data.begin_time)),
						end: new Date(Date._parse(ThisEvent.data.begin_date+' '+ThisEvent.data.end_time)),
						title: 'Get Your Flu Shot',
						summary: 'Get Your Flu Shot',
						description: ThisEvent.data.hours+" "+ThisEvent.data.cost+" Please remember to bring your" +
						" immunization/shot records with you.",
						location: ThisEvent.data.facility_name+' - '+ThisEvent.data.street1+' - '+ThisEvent.data.city+' '+ThisEvent.data.state+' '+ThisEvent.data.postal_code,
						iconSize: 16,
						sites: ['icalendar'],
						echoUrl: '//flushots.smartchicagoapps.org/ical.php'
					});

				$('#modal-event').modal();
			};
		};
	};
	return constructor;
})(jQuery);