/**
 * Google Fusion Table connector and data
 */
var FusionTable = (function(){
	var constructor = function(url,query,googlemapsapikey)
	{
		this.columns = null;
		this.rows = null;
		this.url = url+'?sql='+encodeURIComponent(query)+'&key='+googlemapsapikey+'&callback=?';
	};
	return constructor;
})();