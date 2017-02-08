;(function(){

    angular.module('ClicktimeChallenge', [])
        .controller('mapController', function($scope){
            $scope.waypoints = [];
            $scope.stops = [];

            //Initializes Google maps services
            $scope.initialize = function() {
                var donutLocation, coffeeLocation
                var directionsDisplay = new google.maps.DirectionsRenderer;
                var directionsService = new google.maps.DirectionsService;
                var map = new google.maps.Map(document.getElementById('map'), {
                    center: {lat: Number(localStorage.getItem("lat")) || -34.397, lng: Number(localStorage.getItem("lng")) || 150.644},
                    zoom: 10,
                    styles: [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#46bcec"},{"visibility":"on"}]}],
                    disableDefaultUI: true
                });

                directionsDisplay.setMap(map);

                
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
                        
                    });
                    } else {
                    window.alert(`Browser doesn't support Geolocation`);
                }

                //Reads in the type of transportation the user is taking and calculates the routing accordingly
                document.getElementById('bike').addEventListener('click', function() {
                    if(coffeeLocation || donutLocation) {
                        coffeeLocation.setMap(null);
                        donutLocation.setMap(null);
                    }
                    $scope.travel = 'BICYCLING'
                    $scope.calculateAndDisplayRoute(directionsService, directionsDisplay);
                });

                document.getElementById('walk').addEventListener('click', function() {
                    if(coffeeLocation || donutLocation) {
                        coffeeLocation.setMap(null);
                        donutLocation.setMap(null);
                    }
                    $scope.travel = 'WALKING'
                    $scope.calculateAndDisplayRoute(directionsService, directionsDisplay);
                });

                //Special Workarounds for Transit because the traditonal waypoints won't work with it
                document.getElementById('transit').addEventListener('click', function() {
                    $scope.travel = 'TRANSIT'
                    $scope.calculateAndDisplayRouteTransit(directionsService, directionsDisplay);
                    
                    //Sets two markers to be placed on the map to visualize where the two shops are
                    coffeeLocation = new google.maps.Marker({
                        position: new google.maps.LatLng($scope.stops[0].geometry.location.lat(), $scope.stops[0].geometry.location.lng()),
                        title: $scope.stops[0].name
                    });
                    donutLocation = new google.maps.Marker({
                        position: new google.maps.LatLng($scope.stops[1].geometry.location.lat(), $scope.stops[1].geometry.location.lng()),
                        title: $scope.stops[1].name
                    });

                    //Creates the title windows for the markers
                    var coffeeInfo = new google.maps.InfoWindow({
                        content: $scope.stops[0].name
                    });
                    var donutInfo = new google.maps.InfoWindow({
                        content: $scope.stops[1].name
                    });

                    coffeeLocation.setMap(map)
                    donutLocation.setMap(map)

                    coffeeLocation.addListener('click', function() {
                        coffeeInfo.open(map, coffeeLocation);
                    });
                    donutLocation.addListener('click', function() {
                        donutInfo.open(map, donutLocation);
                    });
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
                    destination: {'placeId': 'ChIJVyk2ZnyAhYARjmWYsnV59jE'},
                    waypoints: $scope.waypoints,
                    optimizeWaypoints: true,
                    travelMode: google.maps.TravelMode[$scope.travel]
                    }, function(response, status) {
                    if (status == 'OK') {
                        console.log(response)
                        directionsDisplay.setDirections(response);
                        writeDirections(response.routes[0]);
                        document.getElementById("stops").innerHTML = `You're stopping at <b>${$scope.stops[0].name}</b> and <b>${$scope.stops[1].name}</b> on your way into the ClickTime office`;

                    } else {
                        window.alert(`Can't get directions for ${$scope.travel.toLowerCase()} from where you are`);
                    }
                });
            }

            //Specific Transit routing function, doesn't use waypoints, only goes from origin to destination
            $scope.calculateAndDisplayRouteTransit = function(directionsService, directionsDisplay) {

                directionsService.route({
                    origin: {lat: Number(localStorage.getItem("lat")) || 37.77, lng: Number(localStorage.getItem("lng")) || -122.447},
                    destination: {'placeId': 'ChIJVyk2ZnyAhYARjmWYsnV59jE'},
                    travelMode: google.maps.TravelMode[$scope.travel]
                    }, function(response, status) {
                    if (status == 'OK') {
                        console.log(response)
                        directionsDisplay.setDirections(response);
                        writeDirections(response.routes[0]);
                        document.getElementById("stops").innerHTML = `Try and stop at <b>${$scope.stops[0].name}</b> and <b>${$scope.stops[1].name}</b> on your way into the ClickTime office`;

                    } else {
                        window.alert(`Can't get directions for ${$scope.travel.toLowerCase()} from where you are`);
                    }
                });
            }

            //Prints out step by step route directions for all sections of the trip
            function writeDirections(route) {
                var legs = route.legs;
                fixStopOrder(route.waypoint_order);
                var overlayContent = document.getElementById("overlayContent");
                overlayContent.innerHTML = '';

                for (var i = 0; i < legs.length; i++) {
                    var currentStep = legs[i].steps;
                    for(var j = 0; j < currentStep.length; j++){     
                        overlayContent.innerHTML += '<p>' + currentStep[j].instructions + '</p><small>' + currentStep[j].distance.text + '</small>';
                    }
                    if($scope.travel == 'TRANSIT'){
                        overlayContent.innerHTML += '<h5 style="text-align: center; padding-bottom: 20px;">Arrive at Work</h5>'
                        return;
                    }
                    if(i == 0){
                        overlayContent.innerHTML += '<h5 style="text-align: center; padding-bottom: 20px;">Stop at ' + $scope.stops[0].name + '</h5>'
                    } else if (i == 1){
                        overlayContent.innerHTML += '<h5 style="text-align: center; padding-bottom: 20px;">Stop at ' + $scope.stops[1].name + '</h5>'
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

            //Corrects Optimized Waypoint order if needed
            function fixStopOrder(order){
                if(order[0] == 0){
                    return
                } else {
                    var temp = $scope.stops[1];
                    $scope.stops[1] = $scope.stops[0];
                    $scope.stops[0] = temp;
                }
            }

       
            google.maps.event.addDomListener(window, 'load', $scope.initialize); 


        })

        
        

}());