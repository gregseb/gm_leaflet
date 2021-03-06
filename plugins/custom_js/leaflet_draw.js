(function($) {
  Drupal.gmLeafletDraw = function(map, settings, drawSettings, layerSwitcher) {
    cookieName = "gm_leaflet_draw_" + settings.id;
    if (Drupal.settings['gm_leaflet-leaflet_draw-cookieKey']) {
      cookieName += '-' + Drupal.settings['gm_leaflet-leaflet_draw-cookieKey'];
    }

    // Initialize the FeatureGroup to store editable layers
    var drawnItems = new L.FeatureGroup();
    drawnItems.addTo(map);
    layerSwitcher.addOverlay(drawnItems, 'Drawn Items');

    if ($.cookie(cookieName)) {
      var geoJSON = JSON.parse($.cookie(cookieName));
      if (geoJSON) {
        geoJSONLayer = new L.geoJson(geoJSON, {
          onEachFeature: function(featureData, layer) {
            drawnItems.addLayer(layer);
          }
        });

        // It seems an empty collection can be passed at times.  Fallback to the default setView in that case.
        if ((geoJSON.coordinates && geoJSON.coordinates.length > 0) || (geoJSON.geometries && geoJSON.geometries.length > 0) || (geoJSON.features && geoJSON.features.length > 0)) {
          $bounds = drawnItems.getBounds();
          map.fitBounds($bounds);
        } else {
          map.setView([settings.lat, settings.lon], settings.zoom);
        }
      } else {
        map.setView([settings.lat, settings.lon], settings.zoom);
      }
    } else {
      map.setView([settings.lat, settings.lon], settings.zoom);
    }

    // Initialize the draw control and pass it the FeatureGroup of editable layers
    var drawControl = new L.Control.Draw({
      draw: {
        position: 'topleft',
        polygon: {
          title: 'Draw a sexy polygon!',
          allowIntersection: false,
          drawError: {
            color: '#b00b00',
            timeout: 1000
          },
          shapeOptions: {
            color: '#bada55'
          },
          showArea: true
        },
        polyline: {
          metric: false
        },
        circle: {
          shapeOptions: {
            color: '#662d91'
          }
        }
      },
      edit: {
        featureGroup: drawnItems
      }
    });
    drawControl.addTo(map);

    map.on('draw:created', function (e) {
      //var type = e.layerType,
      layer = e.layer;
      drawnItems.addLayer(layer);

      geoJSON = drawnItems.toGeoJSON();
      $.cookie(cookieName, JSON.stringify(geoJSON));
    });
    map.on('draw:edited', function(e) {
      //layers = e.layers;
      geoJSON = drawnItems.toGeoJSON();
      $.cookie(cookieName, JSON.stringify(geoJSON));
    });
    map.on('draw:deleted', function(e) {
      //layers = e.layers;
      geoJSON = drawnItems.toGeoJSON();
      $.cookie(cookieName, JSON.stringify(geoJSON));
    });
  }
}(jQuery));
