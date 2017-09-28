/* eslint-disable no-param-reassign */
/* eslint-disable react/no-multi-comp */
import d3 from 'd3';
import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import MapGL from 'react-map-gl';
import Immutable from 'immutable';
import ViewportMercator from 'viewport-mercator-project';
import {json as requestJson} from 'd3-request';
import DeckGL, {GeoJsonLayer} from 'deck.gl';

import './mapbox_with_polygon.css';

const NOOP = () => {};

class MapboxViz extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
    const longitude = this.props.viewportLongitude || DEFAULT_LONGITUDE;
    const latitude = this.props.viewportLatitude || DEFAULT_LATITUDE;

    this.state = {
      viewport: {
        longitude,
        latitude,
        zoom: this.props.viewportZoom || DEFAULT_ZOOM,
        startDragLngLat: [longitude, latitude],
      },
      geojson: null,
      dmap: null,
      x_coord: 0, 
      y_coord: 0, 
      properties: null,
      hoveredFeature: false
    };
    this.onViewportChange = this.onViewportChange.bind(this);
    this._onHover = this._onHover.bind(this);
    this._renderTooltip = this._renderTooltip.bind(this);

  }
  
  componentDidMount() {
      var country = this.props.country;
      requestJson('/static/assets/visualizations/countries/'+country+'.geojson', (error, response) => {
        if (!error) {
            var resp = this.props.dataResponse;
            var data_map = [];
            for (var i = 0; i < resp.length; i++) {
                var key = resp[i].country_id;
                data_map[key] = resp[i].metric;
            }

            console.log(data_map)
            this.setState({ geojson: response, dmap: data_map });           
        }
      });
    }

  onViewportChange(viewport) {
    this.setState({ viewport });
    this.props.setControlValue('viewport_longitude', viewport.longitude);
    this.props.setControlValue('viewport_latitude', viewport.latitude);
    this.props.setControlValue('viewport_zoom', viewport.zoom);
  }

  initialize(gl) {
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE_MINUS_DST_ALPHA, gl.ONE);
    gl.blendEquation(gl.FUNC_ADD);
  }


  _onHover(event) {
    
    var hoveredFeature = false;
    var properties = event.object.properties;
    var x_coord = event.x;
    var y_coord = event.y; 
    hoveredFeature = true;
    this.setState({x_coord,y_coord,properties,hoveredFeature });
    console.log("Hovered");
    console.log(event);
  }

  _renderTooltip() {
    const {hoveredFeature, properties, x_coord, y_coord, dmap} = this.state;
    console.log("hoveredFeature");
    console.log(hoveredFeature);
    return hoveredFeature && (
      <div className="tooltip" style={{left: x_coord, top: y_coord}}>
        <div>ID: {properties.ISO}</div>
        <div>Region: {properties.NAME_2}</div>
        <div>Count: {dmap[properties.ISO]}</div>
      </div>
    );
  }



  render() {

    const { geojson, dmap} = this.state;

    const colorScale = r => [r * 255, 200 * (1 - r),50];
    var maxCount = d3.max(d3.values(dmap));
    var minCount = d3.min(d3.values(dmap));

    const geosjsonLayer = new GeoJsonLayer({
      id: 'geojson-layer',
      data: geojson,
      opacity: 0.3,
      filled: true,
      stroked: true,
      lineWidthMinPixels: 1,
      lineWidthScale: 2,
      getFillColor: f => colorScale((dmap[f.properties.ISO] - minCount)/(maxCount-minCount)),      
      pickable: true      
    });


    return (      
       <MapGL
          {...this.state.viewport}
          mapboxApiAccessToken={this.props.mapboxApiKey}
          mapStyle={this.props.mapStyle}
          perspectiveEnabled
          width={this.props.sliceWidth}
          height={this.props.sliceHeight}
          onChangeViewport={this.onViewportChange}
        >        
          <DeckGL
            {...this.state.viewport}
            layers={[geosjsonLayer]}
            onWebGLInitialized={this.initialize}
            onLayerHover={this._onHover}
          />          
           {this._renderTooltip()}
        </MapGL>
    );
  }
}
MapboxViz.propTypes = {
  setControlValue: PropTypes.func,
  globalOpacity: PropTypes.number,
  mapStyle: PropTypes.string,
  mapboxApiKey: PropTypes.string,
  renderWhileDragging: PropTypes.bool,
  rgb: PropTypes.array,
  sliceHeight: PropTypes.number,
  sliceWidth: PropTypes.number,
  viewportLatitude: PropTypes.number,
  viewportLongitude: PropTypes.number,
  viewportZoom: PropTypes.number,
};

function mapbox_with_polygon(slice, json, setControlValue) {
  const div = d3.select(slice.selector);
  const DEFAULT_MAX_ZOOM = 16;
  
  // Validate mapbox color
  const rgb = /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/.exec(json.data.color);
  if (rgb === null) {
    slice.error('Color field must be of form \'rgb(%d, %d, %d)\'');
    return;
  }
  
  div.selectAll('*').remove();
  ReactDOM.render(
    <MapboxViz
      {...json.data}
      rgb={rgb}
      sliceHeight={slice.height()}
      sliceWidth={slice.width()}
      setControlValue={setControlValue || NOOP}
    />,
    div.node(),
  );
}

module.exports = mapbox_with_polygon;
