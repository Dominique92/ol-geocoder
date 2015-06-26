# OpenLayers 3 Control Geocoder Nominatim
A geocoder extension for OpenLayers 3.


## Demo
You can see [here a demo](http://rawgit.com/jonataswalker/ol3-geocoder/master/examples/control-nominatim.html).

## How to use it?
Load the CSS and Javascript:

```HTML
<link rel="stylesheet" href="ol3-geocoder.css" />
<script src="ol3-geocoder.js"></script>
```

Add the control:

```javascript
var geocoder = new geocoder.Nominatim();
map.addControl(geocoder);
```

If you want to listen to changes and show a popup:

```javascript
geocoder.on('change:geocoder', function(evt){
    var feature_id = evt.target.get('geocoder');
    var feature = geocoder.getSource().getFeatureById(feature_id);
    var address = feature.get('address');
    var coord = feature.getGeometry().getCoordinates();
    content.innerHTML = '<p>'+address+'</p>';
    overlay.setPosition(coord);
});
```