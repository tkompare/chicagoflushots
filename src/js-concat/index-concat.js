var saveAs=saveAs||function(e){"use strict";if(typeof e==="undefined"||typeof navigator!=="undefined"&&/MSIE [1-9]\./.test(navigator.userAgent)){return}var t=e.document,n=function(){return e.URL||e.webkitURL||e},r=t.createElementNS("http://www.w3.org/1999/xhtml","a"),o="download"in r,a=function(e){var t=new MouseEvent("click");e.dispatchEvent(t)},i=/constructor/i.test(e.HTMLElement)||e.safari,f=/CriOS\/[\d]+/.test(navigator.userAgent),u=function(t){(e.setImmediate||e.setTimeout)(function(){throw t},0)},s="application/octet-stream",d=1e3*40,c=function(e){var t=function(){if(typeof e==="string"){n().revokeObjectURL(e)}else{e.remove()}};setTimeout(t,d)},l=function(e,t,n){t=[].concat(t);var r=t.length;while(r--){var o=e["on"+t[r]];if(typeof o==="function"){try{o.call(e,n||e)}catch(a){u(a)}}}},p=function(e){if(/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(e.type)){return new Blob([String.fromCharCode(65279),e],{type:e.type})}return e},v=function(t,u,d){if(!d){t=p(t)}var v=this,w=t.type,m=w===s,y,h=function(){l(v,"writestart progress write writeend".split(" "))},S=function(){if((f||m&&i)&&e.FileReader){var r=new FileReader;r.onloadend=function(){var t=f?r.result:r.result.replace(/^data:[^;]*;/,"data:attachment/file;");var n=e.open(t,"_blank");if(!n)e.location.href=t;t=undefined;v.readyState=v.DONE;h()};r.readAsDataURL(t);v.readyState=v.INIT;return}if(!y){y=n().createObjectURL(t)}if(m){e.location.href=y}else{var o=e.open(y,"_blank");if(!o){e.location.href=y}}v.readyState=v.DONE;h();c(y)};v.readyState=v.INIT;if(o){y=n().createObjectURL(t);setTimeout(function(){r.href=y;r.download=u;a(r);h();c(y);v.readyState=v.DONE});return}S()},w=v.prototype,m=function(e,t,n){return new v(e,t||e.name||"download",n)};if(typeof navigator!=="undefined"&&navigator.msSaveOrOpenBlob){return function(e,t,n){t=t||e.name||"download";if(!n){e=p(e)}return navigator.msSaveOrOpenBlob(e,t)}}w.abort=function(){};w.readyState=w.INIT=0;w.WRITING=1;w.DONE=2;w.error=w.onwritestart=w.onprogress=w.onwrite=w.onabort=w.onerror=w.onwriteend=null;return m}(typeof self!=="undefined"&&self||typeof window!=="undefined"&&window||this.content);if(typeof module!=="undefined"&&module.exports){module.exports.saveAs=saveAs}else if(typeof define!=="undefined"&&define!==null&&define.amd!==null){define("FileSaver.js",function(){return saveAs})}

var ics=function(e,t){"use strict";{if(!(navigator.userAgent.indexOf("MSIE")>-1&&-1==navigator.userAgent.indexOf("MSIE 10"))){void 0===e&&(e="default"),void 0===t&&(t="Calendar");var r=-1!==navigator.appVersion.indexOf("Win")?"\r\n":"\n",n=[],i=["BEGIN:VCALENDAR","PRODID:"+t,"VERSION:2.0"].join(r),o=r+"END:VCALENDAR",a=["SU","MO","TU","WE","TH","FR","SA"];return{events:function(){return n},calendar:function(){return i+r+n.join(r)+o},addEvent:function(t,i,o,l,u,s){if(void 0===t||void 0===i||void 0===o||void 0===l||void 0===u)return!1;if(s&&!s.rrule){if("YEARLY"!==s.freq&&"MONTHLY"!==s.freq&&"WEEKLY"!==s.freq&&"DAILY"!==s.freq)throw"Recurrence rrule frequency must be provided and be one of the following: 'YEARLY', 'MONTHLY', 'WEEKLY', or 'DAILY'";if(s.until&&isNaN(Date.parse(s.until)))throw"Recurrence rrule 'until' must be a valid date string";if(s.interval&&isNaN(parseInt(s.interval)))throw"Recurrence rrule 'interval' must be an integer";if(s.count&&isNaN(parseInt(s.count)))throw"Recurrence rrule 'count' must be an integer";if(void 0!==s.byday){if("[object Array]"!==Object.prototype.toString.call(s.byday))throw"Recurrence rrule 'byday' must be an array";if(s.byday.length>7)throw"Recurrence rrule 'byday' array must not be longer than the 7 days in a week";s.byday=s.byday.filter(function(e,t){return s.byday.indexOf(e)==t});for(var c in s.byday)if(a.indexOf(s.byday[c])<0)throw"Recurrence rrule 'byday' values must include only the following: 'SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'"}}var g=new Date(l),d=new Date(u),f=new Date,S=("0000"+g.getFullYear().toString()).slice(-4),E=("00"+(g.getMonth()+1).toString()).slice(-2),v=("00"+g.getDate().toString()).slice(-2),y=("00"+g.getHours().toString()).slice(-2),A=("00"+g.getMinutes().toString()).slice(-2),T=("00"+g.getSeconds().toString()).slice(-2),b=("0000"+d.getFullYear().toString()).slice(-4),D=("00"+(d.getMonth()+1).toString()).slice(-2),N=("00"+d.getDate().toString()).slice(-2),h=("00"+d.getHours().toString()).slice(-2),I=("00"+d.getMinutes().toString()).slice(-2),R=("00"+d.getMinutes().toString()).slice(-2),M=("0000"+f.getFullYear().toString()).slice(-4),w=("00"+(f.getMonth()+1).toString()).slice(-2),L=("00"+f.getDate().toString()).slice(-2),O=("00"+f.getHours().toString()).slice(-2),p=("00"+f.getMinutes().toString()).slice(-2),Y=("00"+f.getMinutes().toString()).slice(-2),U="",V="";y+A+T+h+I+R!=0&&(U="T"+y+A+T,V="T"+h+I+R);var B,C=S+E+v+U,j=b+D+N+V,m=M+w+L+("T"+O+p+Y);if(s)if(s.rrule)B=s.rrule;else{if(B="rrule:FREQ="+s.freq,s.until){var x=new Date(Date.parse(s.until)).toISOString();B+=";UNTIL="+x.substring(0,x.length-13).replace(/[-]/g,"")+"000000Z"}s.interval&&(B+=";INTERVAL="+s.interval),s.count&&(B+=";COUNT="+s.count),s.byday&&s.byday.length>0&&(B+=";BYDAY="+s.byday.join(","))}(new Date).toISOString();var H=["BEGIN:VEVENT","UID:"+n.length+"@"+e,"CLASS:PUBLIC","DESCRIPTION:"+i,"DTSTAMP;VALUE=DATE-TIME:"+m,"DTSTART;VALUE=DATE-TIME:"+C,"DTEND;VALUE=DATE-TIME:"+j,"LOCATION:"+o,"SUMMARY;LANGUAGE=en-us:"+t,"TRANSP:TRANSPARENT","END:VEVENT"];return B&&H.splice(4,0,B),H=H.join(r),n.push(H),H},download:function(e,t){if(n.length<1)return!1;t=void 0!==t?t:".ics",e=void 0!==e?e:"calendar";var a,l=i+r+n.join(r)+o;if(-1===navigator.userAgent.indexOf("MSIE 10"))a=new Blob([l]);else{var u=new BlobBuilder;u.append(l),a=u.getBlob("text/x-vCalendar;charset="+document.characterSet)}return saveAs(a,e+t),l},build:function(){return!(n.length<1)&&i+r+n.join(r)+o}}}console.log("Unsupported Browser")}};;var Vaccinate = {

	Configs: null,
	Events: null,
	Map: null,
	Marker: null,
	i: null, // Events iterator

	loadScript: function() {
		$.when(
			/*
			 * Get the configuration for the application from the configuration JSON file.
			 */
			$.getJSON("js/configure.json", function(configs) {
				Vaccinate.Configs = configs;
			})
		).then(function(){
			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = 'https://maps.googleapis.com/maps/api/js?key='+Vaccinate.Configs.Google.key+'&' +
				'callback=Vaccinate.initialize';
			document.body.appendChild(script);
		});
	},

	mdyToDate: function(mdy) {
		var mdyArray = mdy.split("/");
		// add in leading zero if month or date are one character in length
		for(var j=0; j<mdyArray.length; j++){
			if(mdyArray[j].length === 1 ){
				mdyArray[j] = '0'+mdyArray[j];
			}
		}
		return  new Date(mdyArray[2]+'-'+mdyArray[0]+'-'+mdyArray[1]);
	},

	intToDayName: function(int) {
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
	},

	intToMonthName: function(int) {
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
	},

	initialize: function(){
		$.when(
			/*
			 * Get event data from a Google Spreadsheet.
			 */
			$.getJSON('https://sheets.googleapis.com/v4/spreadsheets/'+Vaccinate.Configs.Google.sheet.id+'/values/'+Vaccinate.Configs.Google.sheet.values+'?majorDimension='+Vaccinate.Configs.Google.sheet.majorDimension+'&key='+Vaccinate.Configs.Google.key, function(events) {
				// Use map/reduce to transform Sheet data to an array of objects using the first 'row' to define properties
				var keys = events.values.shift();
				Vaccinate.Events = events.values.map(function(values) {
					return keys.reduce(function(object, key, i) {
						object[key] = values[i];
						return object;
					}, {});
				});
			})
		).then(function(){
			Vaccinate.Map = new google.maps.Map(document.getElementById('map'), {
				zoom: Vaccinate.Configs.Map.zoom,
				center: Vaccinate.Configs.Map.center,
				styles: Vaccinate.Configs.Map.styles,
				clickableIcons: Vaccinate.Configs.Map.clickableIcons,
				mapTypeControl: Vaccinate.Configs.Map.mapTypeControl,
				panControl: Vaccinate.Configs.Map.panControl,
				streetViewControl: Vaccinate.Configs.Map.streetViewControl,
				zoomControl: Vaccinate.Configs.Map.zoomControl,
				maxZoom: Vaccinate.Configs.Map.maxZoom,
				minZoom: Vaccinate.Configs.Map.minZoom,
				zoomControlOptions: {
					"position": google.maps.ControlPosition.RIGHT_TOP
				},
				fullscreenControl: Vaccinate.Configs.Map.fullscreenControl
			});

			for (Vaccinate.i = 0; Vaccinate.i < Vaccinate.Events.length; Vaccinate.i++) {
				Vaccinate.Events[Vaccinate.i]['Selected'] = false;
				if(Vaccinate.Events[Vaccinate.i]['BeginTime'] === '') {
					Vaccinate.Events[Vaccinate.i]['MomentBeginDateTime'] = moment(Vaccinate.Events[Vaccinate.i]['BeginDate'], "l");
				}
				Vaccinate.Marker = new google.maps.Marker({
					position: new google.maps.LatLng(Vaccinate.Events[Vaccinate.i]['Latitude'], Vaccinate.Events[Vaccinate.i]['Longitude']),
					map: Vaccinate.Map
				});
				google.maps.event.addListener(Vaccinate.Marker, 'click', (function(marker, i) {
					return function() {
						$('#modal-event-detail-title').html(Vaccinate.Events[i]['LocationName']);
						var body = '<p>'+Vaccinate.Events[i]['Address1'];
						if(Vaccinate.Events[i]['Address2'].trim() !== ''){
							body += ' '+Vaccinate.Events[i]['Address2'];
						}
						body += '<br>'+Vaccinate.Events[i]['City']+', '+Vaccinate.Events[i]['State']+' '+Vaccinate.Events[i]['PostalCode'];
						if(Vaccinate.Events[i]['Phone'] !== '' || Vaccinate.Events[i]['Contact'] !== '') {
							body += '<br>';
							if(Vaccinate.Events[i]['Contact'] !== '') {
								body += 'Contact: '+Vaccinate.Events[i]['Contact'];
							}
							if(Vaccinate.Events[i]['Phone'] !== '' && Vaccinate.Events[i]['Contact'] !== '') {
								body += ' at ';
							}
							if(Vaccinate.Events[i]['Phone'] !== '') {
								body += Vaccinate.Events[i]['Phone'];
							}
						}
						if(Vaccinate.Events[i]['Url'] !== '') {
							body += '<br><a href="'+Vaccinate.Events[i]['Url']+'" target="_blank">'+Vaccinate.Events[i]['Url']+'</a>';
						}
						var momentBeginDate = moment(Vaccinate.Events[i]['BeginDate'], "l");
						body += '<hr>'+momentBeginDate.format('dddd, MMMM Do, YYYY');
						// If this is single day event...
						if(Vaccinate.Events[i]['BeginDate'] === Vaccinate.Events[i]['EndDate']) {
							body += '<hr>Hours: '+Vaccinate.Events[i]['BeginTime']+' to '+Vaccinate.Events[i]['EndTime'];
							var cal = new ics(); // Make the ical! https://github.com/nwcell/ics.js
							cal.addEvent(Vaccinate.Events[i]['LocationName'],
								Vaccinate.Events[i]['NotesText']+" "+Vaccinate.Events[i]['Contact']+" "+Vaccinate.Events[i]['Phone']+" "+Vaccinate.Events[i]['Url'],
								Vaccinate.Events[i]['FormattedAddress'],
								Vaccinate.Events[i]['BeginDate']+' '+Vaccinate.Events[i]['BeginTime'],
								Vaccinate.Events[i]['EndDate']+' '+Vaccinate.Events[i]['EndTime']);
							$('#modal-event-detail-ical').on('click', function(){
								cal.download();
							});
						} else {
							// If this is not a single day event...
							var momentEndDate = moment(Vaccinate.Events[i]['EndDate'], "l");
							body += '<hr>'+momentEndDate.format('dddd, MMMM Do, YYYY');
						}
						body += '</p>';
						$('#modal-event-detail-body').html(body);
						$('#modal-event-detail').modal('show');
					}
				})(Vaccinate.Marker, Vaccinate.i));
			}
		});
		/*
		Listen for clicks on the Search button in the header
		 */
		$('#search').on('click', function(){
			$('#modal-search-title').html(Vaccinate.Configs.Modal.search.title);
			$('#modal-search-body-instructions').html(Vaccinate.Configs.Modal.search.instructions);
			$('#modal-search').modal('show');
		});
		/*
		Listen to the Search Modal's Search button
		 */
		$('#modal-search-search').on('click', function(){

		});
		/*
			Listen for a click on the search date picker.
		 */
		$('#modal-search-date').datetimepicker({
			format: 'L', // or 'l' (lowercase L) for non-zero-padded
			date: moment().format('L'),
			ignoreReadonly: true
		});
	},

	searchByDate: function(Date) {
		var searchDate = moment(Date);
		for (Vaccinate.i = 0; Vaccinate.i < Vaccinate.Events.length; Vaccinate.i++) {
			var momentBeginDate = moment(Vaccinate.Events[Vaccinate.i]['BeginDate'], "l");
			var momentEndDate = moment(Vaccinate.Events[Vaccinate.i]['EndDate'], "l");
		}
	}

};

window.onload = Vaccinate.loadScript;