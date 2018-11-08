import React, {Component} from 'react';
import LocationList from './LocationList';


class App extends Component {
    /**
     * Constructor
     */
    constructor(props) {
        super(props);
        this.state = {
            'alllocations': [

                {
                    'name': "Barriles Restaurant",
                    'type': "Colombian Restaurant",
                    'latitude': 40.7496763,
                    'longitude': -73.8828024 ,
                    'streetAddress': "8314 37Ave, Flushing, NY 11372, USA"
                },
                {
                    'name': "Pollos Mario",
                    'type': "Colombian Restaurant",
                    'latitude': 40.7483269 ,
                    'longitude': -73.87963660000002,
                    'streetAddress': "86-13 Roosevelt Ave, Jackson Heights, NY 11372"
                },
                {
                    'name': "Raices Colombianas",
                    'type': "Colombian Restaurant",
                    'latitude': 40.7499368 ,
                    'longitude': -73.88038999999998 ,
                    'streetAddress': "18, Gautam Marg, Vaishali Nagar"
                },
                {
                    'name': "La Abundancia Bakery",
                    'type': "Colombian Restaurant",
                    'latitude': 40.7467863,
                    'longitude': -73.89032600000001 ,
                    'streetAddress': "7502 Roosevelt Ave, Jackson Heights, NY 11372"
                },
                {
                    'name': "Cositas Ricas",
                    'type': "Colombian Restaurant",
                    'latitude': 40.747640,
                    'longitude': -73.885990,
                    'streetAddress': "Vaishali Tower, Vaishali Nagar"
                },
                {
                    'name': "La pollera colorada",
                    'type': "Colombian Restaurant",
                    'latitude': 40.74762399999999,
                    'longitude': -73.88595699999996 ,
                    'streetAddress': "7919 Roosevelt Ave, Jackson Heights, NY 11372"
                },
                {
                    'name': "La Pequeña Colombia",
                    'type': "Colombian Restaurant",
                    'latitude': 40.760366,
                    'longitude': -73.87732599999998 ,
                    'streetAddress': "9107 31st Ave, East Elmhurst, NY 11369"
                },

                {
                    'name': "La pollera colorada",
                    'type': "Colombian Restaurant",
                    'latitude': 40.7558502,
                    'longitude': -73.88486749999998,
                    'streetAddress': "8213 Northern Blvd, Flushing, NY 11372"
                },

            ],
            'map': '',
            'infowindow': '',
            'prevmarker': ''
        };

        // retain object instance when used in the function
        this.initMap = this.initMap.bind(this);
        this.openInfoWindow = this.openInfoWindow.bind(this);
        this.closeInfoWindow = this.closeInfoWindow.bind(this);
    }

    componentDidMount() {
        // Connect the initMap() function within this class to the global window context,
        // so Google Maps can invoke it
        window.initMap = this.initMap;
        // Asynchronously load the Google Maps script, passing in the callback reference
        loadMapJS('https://maps.googleapis.com/maps/api/js?key=AIzaSyA1Ayim9wXVJJLIFe7FIgIiWOIShf-cVjE&callback=initMap')
    }

    /**
     * Initialise the map once the google map script is loaded
     */
    initMap() {
        var self = this;

        var mapview = document.getElementById('map');
        mapview.style.height = window.innerHeight + "px";
        var map = new window.google.maps.Map(mapview, {
            center: {lat: 40.761730, lng: -73.879560},
            zoom: 15,
            mapTypeControl: false

        });

        var InfoWindow = new window.google.maps.InfoWindow({});

        window.google.maps.event.addListener(InfoWindow, 'closeclick', function () {
            self.closeInfoWindow();
        });

        this.setState({
            'map': map,
            'infowindow': InfoWindow
        });

        window.google.maps.event.addDomListener(window, "resize", function () {
            var center = map.getCenter();
            window.google.maps.event.trigger(map, "resize");
            self.state.map.setCenter(center);
        });

        window.google.maps.event.addListener(map, 'click', function () {
            self.closeInfoWindow();
        });

        var alllocations = [];
        this.state.alllocations.forEach(function (location) {
            var longname = location.name + ' - ' + location.type;
            var marker = new window.google.maps.Marker({
                position: new window.google.maps.LatLng(location.latitude, location.longitude),
                animation: window.google.maps.Animation.DROP,
                map: map
            });

            marker.addListener('click', function () {
                self.openInfoWindow(marker);
            });

            location.longname = longname;
            location.marker = marker;
            location.display = true;
            alllocations.push(location);
        });
        this.setState({
            'alllocations': alllocations
        });
    }

    /**
     * Open the infowindow for the marker
     * @param {object} location marker
     */
    openInfoWindow(marker) {
        this.closeInfoWindow();
        this.state.infowindow.open(this.state.map, marker);
        marker.setAnimation(window.google.maps.Animation.BOUNCE);
        this.setState({
            'prevmarker': marker
        });
        this.state.infowindow.setContent('Loading Data...');
        this.state.map.setCenter(marker.getPosition());
        this.state.map.panBy(0, -200);
        this.getMarkerInfo(marker);
    }

    /**
     * Retrive the location data from the foursquare api for the marker and display it in the infowindow
     * @param {object} location marker
     */
    getMarkerInfo(marker) {
        var self = this;
        var clientId = "ENROIU2B5UH4KMGPCCVJEC2TAET3MEV00IKYU4GJVSKBWGJO";
        var clientSecret = "FZKZTKA4NEAT1VKB3YWG4VQMGJ1QXKXHQI5TGQ2PR1YWXOMQ";
        var url = "https://api.foursquare.com/v2/venues/search?client_id=" + clientId + "&client_secret=" + clientSecret + "&v=20130815&ll=" + marker.getPosition().lat() + "," + marker.getPosition().lng() + "&limit=1";
        fetch(url)
            .then(
                function (response) {
                    if (response.status !== 200) {
                        self.state.infowindow.setContent("Sorry data can't be loaded");
                        return;
                    }

                    // Examine the text in the response
                    response.json().then(function (data) {
                        var location_data = data.response.venues[0];
                        var verified = '<b>Verified Location: </b>' + (location_data.verified ? 'Yes' : 'No') + '<br>';
                        var checkinsCount = '<b>Number of CheckIn: </b>' + location_data.stats.checkinsCount + '<br>';
                        var usersCount = '<b>Number of Users: </b>' + location_data.stats.usersCount + '<br>';
                        var tipCount = '<b>Number of Tips: </b>' + location_data.stats.tipCount + '<br>';
                        var readMore = '<a href="https://foursquare.com/v/'+ location_data.id +'" target="_blank">Read More on Foursquare Website</a>'
                        self.state.infowindow.setContent(checkinsCount + usersCount + tipCount + verified + readMore);
                    });
                }
            )
            .catch(function (err) {
                self.state.infowindow.setContent("Sorry data can't be loaded");
            });
    }

    /**
     * Close the infowindow for the marker
     * @param {object} location marker
     */
    closeInfoWindow() {
        if (this.state.prevmarker) {
            this.state.prevmarker.setAnimation(null);
        }
        this.setState({
            'prevmarker': ''
        });
        this.state.infowindow.close();
    }

    /**
     * Render function of App
     */
    render() {
        return (
            <div>
                <LocationList key="100" alllocations={this.state.alllocations} openInfoWindow={this.openInfoWindow}
                              closeInfoWindow={this.closeInfoWindow}/>
                <div id="map"></div>
            </div>
        );
    }
}

export default App;

/**
 * Load the google maps Asynchronously
 * @param {url} url of the google maps script
 */
function loadMapJS(src) {
    var ref = window.document.getElementsByTagName("script")[0];
    var script = window.document.createElement("script");
    script.src = src;
    script.async = true;
   window.gm_authFailure = () => {
     alert('ERROR!! \nFailed to get Google map.')
     console.log('ERROR!! \nFailed to get Google map.');
    };
    ref.parentNode.insertBefore(script, ref);
}
