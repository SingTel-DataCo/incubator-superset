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

import {
  kmToPixels,
  rgbLuminance,
  isNumeric,
  MILES_PER_KM,
  DEFAULT_LONGITUDE,
  DEFAULT_LATITUDE,
  DEFAULT_ZOOM,
} from '../utils/common';
import './mapbox_with_polygon.css';

const NOOP = () => {};

function buildStyle({fill = 'red', stroke = 'blue', dataResponse}) {
    return Immutable.fromJS({
      version: 8,
      name: 'Selected GeoJson',
      sources: {
        'geojson-polygon-source': {
          type: 'geojson',
          data: dataResponse
        }
      },
      layers: [
        {
          id: 'geojson-polygon-fill',
          source: 'geojson-polygon-source',
          type: 'fill',
          paint: {'fill-color': fill, 'fill-opacity': 0.4},
          interactive: true
        }, {
          id: 'geojson-polygon-stroke',
          source: 'geojson-polygon-source',
          type: 'line',
          paint: {'line-color': stroke, 'line-width': 4},
          interactive: false
        }
      ]
    });
  }


class MapboxViz extends React.Component {
  constructor(props) {
    super(props);
    const longitude = this.props.viewportLongitude || DEFAULT_LONGITUDE;
    const latitude = this.props.viewportLatitude || DEFAULT_LATITUDE;

    this.state = {
      viewport: {
        longitude,
        latitude,
        zoom: this.props.viewportZoom || DEFAULT_ZOOM,
        startDragLngLat: [longitude, latitude],
      },
    };
    this.onViewportChange = this.onViewportChange.bind(this);
  }
  
  componentDidMount() {
      var country = this.props.country;
      requestJson('/static/assets/visualizations/countries/'+country+'.geojson', (error, response) => {
        if (!error) {
            console.log(response);
            this._loadGeoJson(response);
            
            this.state = {
               mapStyle: buildStyle({stroke: '#FF00FF', fill: 'green', response})
            };
        }
      });
    }

  _loadGeoJson(response) {
      console.log(this.props.mapStyle);
      const mapStyle = this.props.mapStyle;
        // Add geojson source to map
//        .setIn(['sources', 'incomeByState'], fromJS({type: 'geojson', data}))
        // Add point layer to map
//        .set('layers', defaultMapStyle.get('layers').push(dataLayer));

//      this.setState({data, mapStyle});
     // console.log(this.props.mapStyle);
    };
  
  onViewportChange(viewport) {
    this.setState({ viewport });
    this.props.setControlValue('viewport_longitude', viewport.longitude);
    this.props.setControlValue('viewport_latitude', viewport.latitude);
    this.props.setControlValue('viewport_zoom', viewport.zoom);
  }

  render() {
    const mercator = ViewportMercator({
      width: this.props.sliceWidth,
      height: this.props.sliceHeight,
      longitude: this.state.viewport.longitude,
      latitude: this.state.viewport.latitude,
      zoom: this.state.viewport.zoom,
    });
    const topLeft = mercator.unproject([0, 0]);
    const bottomRight = mercator.unproject([this.props.sliceWidth, this.props.sliceHeight]);
    const bbox = [topLeft[0], bottomRight[1], bottomRight[0], topLeft[1]];
    const isDragging = this.state.viewport.isDragging === undefined ? false :
                       this.state.viewport.isDragging;
    return (
      <MapGL
        {...this.state.viewport}
        mapStyle={this.props.mapStyle}
        width={this.props.sliceWidth}
        height={this.props.sliceHeight}
        mapboxApiAccessToken={this.props.mapboxApiKey}
        onViewportChange={this.onViewportChange}
      >
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

  console.log("data repsonse");
  console.log(json.data.dataResponse);
  
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
