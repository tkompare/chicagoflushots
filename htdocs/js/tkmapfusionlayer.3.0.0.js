function TkMapFusionLayer(Args)
{
	/* PROPERTIES **************************************************************/
	/* Default private properties from required arguments */
	// The Google Maps map object
	var Map = typeof Args.map !== 'undefined' ? Args.map : null;
	// The column in the Fusion Table that holds the location data.
	var Geo = typeof Args.geo !== 'undefined' ? Args.geo : null;
	// The Google Fusion Table ID
	var TableId = typeof Args.tableid !== 'undefined' ? Args.tableid : null;
	/* Default private properties from optional arguments */
	// The WHERE clause in the table query
	var Where = typeof Args.where !== 'undefined' ? Args.where : null;
	// The column name that contains the Google icon name
	var Icon = typeof Args.icon !== 'undefined' ? Args.icon : null;
	// The style object
	var Style = typeof Args.style !== 'undefined' ? Args.style : null;
	// Default public properties
	this.Layer = null;
	/* METHODS *****************************************************************/
	this.showLayer = function(Args)
	{
		// Set properties from arguments
		var showWhere = typeof Args.where !== 'undefined' ? Args.where : Where;
		var showIcon = typeof Args.icon !== 'undefined' ? Args.icon : Icon;
		var showStyle = typeof Args.linestyle !== 'undefined' ? Args.style : Style;
		// Hide the layer
		this.hideLayer();
		// Am I displaying a search result?
		var Query = null;
		if (showWhere === null) {
			Query = {
					select: Geo,
					from: TableId
			};
		}
		else
		{
			Query = {
					select: Geo,
					from: TableId,
					where: showWhere
			};
		}
		if (showIcon !== null)
		{
			this.Layer = new google.maps.FusionTablesLayer({
				clickable : true,
				query: Query,
				styles: [{
					markerOptions: { iconName: showIcon }
				}]
			});
		}
		else if (showStyle !== null)
		{
			this.Layer = new google.maps.FusionTablesLayer({
				clickable : true,
				query: Query,
				styles: showStyle
			});
		}
		else
		{
			this.Layer = new google.maps.FusionTablesLayer({
				clickable : true,
				query: Query
			});
		}
		this.Layer.setMap(Map);
	};
	this.hideLayer = function()
	{
		if (this.Layer !== null)
		{
			this.Layer.setMap(null);
		}
	};
	if (Map !== null && Geo !== null && TableId !== null)
	{
		this.showLayer({});
	}
}