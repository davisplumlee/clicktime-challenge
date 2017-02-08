;(function(){

    angular.module('ClicktimeChallenge', [])
        .controller('mapController', function($scope){
            $scope.waypoints = [];
            $scope.stops = [];

            //Initializes Google maps services
            $scope.initialize = function() {

                var directionsDisplay = new google.maps.DirectionsRenderer;
                var directionsService = new google.maps.DirectionsService;
                var map = new google.maps.Map(document.getElementById('map'), {
                    center: {lat: Number(localStorage.getItem("lat")) || -34.397, lng: Number(localStorage.getItem("lng")) || 150.644},
                    zoom: 10,
                    styles: [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#46bcec"},{"visibility":"on"}]}],
                    disableDefaultUI: true
                });

                directionsDisplay.setMap(map);
                directionsDisplay.setPanel(document.getElementById('right-panel'));

                
                //Gets the current location object from the user, alerts message if unable to use
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function(position) {
                        pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                        };
                        if(!localStorage.getItem("lat")){
                            map.setCenter(pos);
                        }
                        localStorage.setItem("lat", pos.lat);
                        localStorage.setItem("lng", pos.lng);
                    }, function() {
                        window.alert(`You must allow current location to be used`);
                    });
                    } else {
                    window.alert(`Browser doesn't support Geolocation`);
                }

                //Reads in the type of transportation the user is taking and calculates the routing accordingly
                document.getElementById('bike').addEventListener('click', function() {
                    $scope.travel = 'BICYCLING'
                    $scope.calculateAndDisplayRoute(directionsService, directionsDisplay);
                });
                document.getElementById('walk').addEventListener('click', function() {
                    $scope.travel = 'WALKING'
                    $scope.calculateAndDisplayRoute(directionsService, directionsDisplay);
                });
                document.getElementById('transit').addEventListener('click', function() {
                    $scope.travel = 'TRANSIT'
                    $scope.calculateAndDisplayRoute(directionsService, directionsDisplay);
                });

                
                var coffeeService = new google.maps.places.PlacesService(map);
                var donutService = new google.maps.places.PlacesService(map);

                //Searches the area nearby the ClickTime office for 'coffee'
                coffeeService.nearbySearch({
                location: {lat: 37.7856359, lng: -122.3993077}, //Can be changed to search around current location
                radius: 500,
                type: ['store'],
                keyword: 'coffee'
                }, processResults);
                
                //Searches the area nearby the ClickTime office for 'donuts'
                donutService.nearbySearch({
                location: {lat: 37.7856359, lng: -122.3993077}, //Can be changed to search around current location
                radius: 1000,
                type: ['food'],
                keyword: 'donuts'
                }, processResults);


            }
            
            
            //Creates the routing object that is displayed on the map and generates step by step directions
            $scope.calculateAndDisplayRoute = function(directionsService, directionsDisplay) {

                directionsService.route({
                    origin: {lat: Number(localStorage.getItem("lat")) || 37.77, lng: Number(localStorage.getItem("lng")) || -122.447},
                    destination: {lat: 37.7856359, lng: -122.3993077},
                    waypoints: $scope.waypoints,
                    optimizeWaypoints: true,
                    travelMode: google.maps.TravelMode[$scope.travel]
                    }, function(response, status) {
                    if (status == 'OK') {

                        directionsDisplay.setDirections(response);
                        writeDirections(response.routes[0].legs);
                        document.getElementById("stops").innerHTML = `You're stopping at <b>${$scope.stops[0].name}</b> and <b>${$scope.stops[1].name}</b> on your way into the ClickTime office`;

                    } else {
                        window.alert(`Can't get directions for ${$scope.travel.toLowerCase()} from where you are`);
                    }
                });
            }

            //Prints out step by step route directions for all sections of the trip
            function writeDirections(legs) {
                var overlayContent = document.getElementById("overlayContent");
                overlayContent.innerHTML = '';

                for (var i = 0; i < legs.length; i++) {
                    var currentStep = legs[i].steps;
                    for(var j = 0; j < currentStep.length; j++){     
                        overlayContent.innerHTML += '<p>' + currentStep[j].instructions + '</p><small>' + currentStep[j].distance.text + '</small>';
                    }
                    if(i != 2){
                        overlayContent.innerHTML += '<h5 style="text-align: center; padding-bottom: 20px;">Stop ' + (i + 1) + '</h5>'
                    } else {
                        overlayContent.innerHTML += '<h5 style="text-align: center; padding-bottom: 20px;">Arrive at Work</h5>'
                    }
                }
            }

            //Generates the position objects for the coffee/donut shops and pushes them into the waypoints array
            function processResults(results, status, pagination) {
                if (status !== google.maps.places.PlacesServiceStatus.OK) {
                    return;
                } else {
                    console.log(results);
                    var random = Math.floor(Math.random() * results.length);
                    var place = new google.maps.LatLng(results[random].geometry.location.lat(), results[random].geometry.location.lng());
                    $scope.waypoints.push({
                        location: place,
                        stopover: true
                    })
                    $scope.stops.push(results[random])
                }
            }

       
            google.maps.event.addDomListener(window, 'load', $scope.initialize); 


        })

        
        

}());