import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import { Grid } from '@mui/material';
import _ from "lodash";
import Table from './Table';
mapboxgl.accessToken = "pk.eyJ1Ijoic2VhbmpodWxzZSIsImEiOiJjamxpM3BxaDExb3VqM2tzNWgzZG81dHVvIn0.wx0OMv7pdDuWHpD1Flfnag";

export default function Map() {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng, setLng] = useState(-70.9);
    const [lat, setLat] = useState(42.35);
    const [zoom, setZoom] = useState(9);
    const [data, setData] = useState([]);
    const [geoJson, setGeoJson] = useState({});

    useEffect(() => {
        if (map.current) return; // initialize map only once

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/dark-v10',
            center: [lng, lat],
            zoom: zoom,
            attributionControl: false
        });

        navigator.geolocation.getCurrentPosition((position) => {
            let lat = position.coords.latitude;
            let lng = position.coords.longitude;

            setLng(lng);
            setLat(lat);
            map.current.jumpTo({center: [lng, lat]});
        });

        map.current.on('load', () => {
            setLng(map.current.getCenter().lng.toFixed(4));
            setLat(map.current.getCenter().lat.toFixed(4));
            setZoom(map.current.getZoom().toFixed(2));

            map.current.addSource('NetworkSurvey', {
                type: 'geojson',
                data: geoJson,
                cluster: true,
                clusterRadius: 10 // Radius of each cluster when clustering points (defaults to 50)
            });

            map.current.addLayer({
                id: 'clusters',
                type: 'circle',
                source: 'NetworkSurvey',
                paint: {
                    // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
                    // with three steps to implement three types of circles:
                    //   * Blue, 20px circles when point count is less than 100
                    //   * Yellow, 30px circles when point count is between 100 and 750
                    //   * Pink, 40px circles when point count is greater than or equal to 750
                    'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 100, '#f1f075', 750, '#f28cb1'],
                    'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40]
                }
            });
        });

        map.current.on('dragend', _.debounce(setSidebarPosition, 200));
        map.current.on('zoom', _.debounce(setSidebarPosition, 200));

        fetch("http://localhost:1880/network-survey?limit=100")
            .then(res => res.json())
            .then(createGeoJson);
        
    });

    const setSidebarPosition = () => {
        const center = map.current.getCenter();
        setLng(center.lng.toFixed(4));
        setLat(center.lat.toFixed(4));
        setZoom(map.current.getZoom().toFixed(2));
    }

    const getBackgroundColor = (payload) => {
        const messageType = { payload };
        switch(messageType) {
            case "WifiBeaconRecord":
                return "white";
            case "BluetoothRecord":
                return "blue";
            case "DeviceStatus":
                return "green";
            default:
                return "red"
        }
    }

    const createGeoJson = (json) => {
        const geoJson = {
            "type": "FeatureCollection",
            "crs": { 
                "type": "name", 
                "properties": { 
                    "name": "urn:ogc:def:crs:OGC:1.3:CRS84" 
                } 
            },
            "features": []
        }
        json.forEach(event => {
            const { payload } = event;
            if (payload.data.latitude && payload.data.longitude) {
                const feature = {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [payload.data.longitude, payload.data.latitude]
                    },
                    'properties': {
                        'title': payload.data.deviceTime,
                        'description': payload.data.missionId
                    }
                };

                // Add geojson to this feature collection
                geoJson.features.push(feature);

                const el = document.createElement('div');
                el.style.backgroundColor = getBackgroundColor(payload);
                el.className = 'marker';
                new mapboxgl.Marker(el)
                    .setLngLat(feature.geometry.coordinates)
                    .addTo(map.current);
            }
        });

        setData(json);
        setGeoJson(geoJson);
    }

    const mapContainerStyle = {
        height: "500px",
    }

    const sideBarStyle = {
        backgroundColor: "rgba(35, 55, 75, 0.9)",
        color: "#fff",
        padding: "6px 12px",
        fontFamily: "monospace",
        zIndex: "1",
        position: "absolute",
        top: 0,
        left: 0,
        margin: "12px",
        borderRadius: "4px"
    };


    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <div style={sideBarStyle}>
                        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
                    </div>
                    <div ref={mapContainer} style={mapContainerStyle} />
                </Grid>
                <Grid item xs={12}>
                    <Table data={data} />
                </Grid>
            </Grid>
        </>
    );
};