'use strict';
(function () {
    function HomeownerMapCtrl($state, $scope, $timeout, GoogleMapApi, homeownerService, homeownerModalService) {
        var self = this,
            defaultZoomLevel = 14,
            googleMaps,
            googleMapsInitialized = GoogleMapApi.then(function (gmaps) {
                googleMaps = gmaps;
                return googleMaps;
            });
        self.vmsWithGeoData = [];
        // Note that the initial center/bounds is arbitrary, since we'll later be fitting to the available points
        self.map = {
            center: {
                latitude: -25.2799209,
                longitude: 133.7768828
            },
            zoom: defaultZoomLevel,
            bounds: {
                northeast: {
                    latitude: -8.229886,
                    longitude: 111.604801
                },
                southwest: {
                    latitude: -37.499414,
                    longitude: 149.969057
                }
            },
            options: {
                mapTypeId: 'roadmap',
                mapTypeControl: false,
                streetViewControl: false,
                panControlOptions: {
                    position: 4 // LEFT_CENTER
                },
                zoomControlOptions: {
                    style: 'small',
                    position: 4 // LEFT_CENTER
                }
            },
            control: {}, // Will have methods added through binding to ui-gmap-google-map, notably getGMap()
            events: {}
        };


        function hideOtherWindows(model) {
            _.forEach(self.vmsWithGeoData, function (viewModel) {
                if (model.id !== viewModel.id) {
                    viewModel.show = false;
                    viewModel.location.stickyShow = false;
                }
            });
        }

        self.markerEvents = {
            mouseover: function (gMarker, eventName, model) {
                model.show = true;
                hideOtherWindows(model);
            },
            mouseout: function (gMarker, eventName, model) {
                model.show = model.location.stickyShow;
            },
            click: function (gMarker, eventName, model) {
                model.location.stickyShow = !model.location.stickyShow;
                model.show = model.location.stickyShow;
                hideOtherWindows(model);
            }
        };
        self.locations = [];
        self.shouldShowMap = false;
        self.searchbox = {
            template: 'app/main/searchbox.tpl.html',
            parentDivId: 'searchBoxParent',
            position: 'top-left',
            events: {
                'places_changed': function centerOnPlaceNearestToMapCenter(searchBox) {
                    console.log('Places Changed');
                    var places = searchBox.getPlaces(),
                        mapCenter = self.map.control.getGMap().getCenter(),
                        shortestDistance = Number.MAX_VALUE,
                        nearestPlaceIndex = -1,
                        currentDistance = Number.MAX_VALUE;
                    if (places.length === 0) {
                        return;
                    }
                    for (var i = 0; i < places.length; i++) {
                        currentDistance = googleMaps.geometry.spherical.computeDistanceBetween(
                            mapCenter,
                            places[i].geometry.location
                        );
                        if (currentDistance < shortestDistance) {
                            shortestDistance = currentDistance;
                            nearestPlaceIndex = i;
                        }
                    }
                    self.map.center.latitude = places[nearestPlaceIndex].geometry.location.lat();
                    self.map.center.longitude = places[nearestPlaceIndex].geometry.location.lng();
                    self.map.zoom = defaultZoomLevel;
                }
            }
        };

        self.editHomeownerInModal = homeownerModalService.editHomeownerInModal;

        function updateSearchBoxBounds() {
            // Use the rough bounds of the continental United States of America as an initial bias for the place search
            googleMapsInitialized.then(function () {
                self.searchbox.bounds = new googleMaps.LatLngBounds(
                    new googleMaps.LatLng(24.14137225564275, -160.2902567423057),
                    new googleMaps.LatLng(56.51988651203465, -63.08322549230576));
            });

        }

        function focusMapOnHomeowner(homeownerVM) {
            self.map.center.latitude = homeownerVM.location.latitude;
            self.map.center.longitude = homeownerVM.location.longitude;
            self.map.zoom = defaultZoomLevel;
        }

        function init() {
            refreshMapInOneTick();

            googleMapsInitialized.then(updateSearchBoxBounds);

            return homeownerService.getHomeownerViewModels().then(function (vms) {
                var lowestSeenIndex = Number.MAX_VALUE,
                    awaitingAddUponLocationResponse = {};
                _.map(vms, function (vm) {
                    if (!vm || !vm.location || !vm.location.geocodeRequestInProgress) {
                        return;
                    }
                    awaitingAddUponLocationResponse[vm.id] = vm.location.geocodeRequestInProgress;

                    function addVmToGeoData() {
                        var index = _.indexOf(vms, vm);
                        self.vmsWithGeoData.push(vm);
                        delete awaitingAddUponLocationResponse[vm.id];
                        if (index < lowestSeenIndex && (!_.isUndefined(vm.location.latitude) && !_.isNull(vm.location.latitude))) {
                            focusMapOnHomeowner(vm);
                            lowestSeenIndex = index;
                        }
                    }

                    if (vm.location.geocodeRequestInProgress) {
                        vm.location.geocodeRequestInProgress
                            .then(function () {
                                addVmToGeoData();
                            });
                    } else {
                        if (vm.location.latitude && vm.location.longitude) {
                            addVmToGeoData();
                        }
                    }
                });

                $scope.$watchCollection(
                    function () {
                        return vms;
                    },
                    function (vms) {
                        var extantGeoCodedVMsById = _.indexBy(self.vmsWithGeoData, 'id'),
                            freshVMsById = _.indexBy(vms, 'id'),
                            firstVM = vms[0];

                        function addMarkersToViewModels(locationResponsePromise, vm) {
                            self.vmsWithGeoData.push(vm);
                            delete locationResponsePromise[vm.id];
                        }

                        _.forIn(freshVMsById, function (vm, key) {
                            if (!extantGeoCodedVMsById[key]) {
                                extantGeoCodedVMsById[key] = vm;
                                if (!awaitingAddUponLocationResponse[vm.id]) {
                                    awaitingAddUponLocationResponse[vm.id] = vm.location.geocodeRequestInProgress;
                                    if (vm.location.geocodeRequestInProgress) {
                                        vm.location.geocodeRequestInProgress.then(function () {
                                            addMarkersToViewModels(awaitingAddUponLocationResponse, vm);
                                            if(vm === firstVM) {
                                                focusMapOnHomeowner(vm);
                                            }
                                        });
                                    } else {
                                        if (vm.location.latitude && vm.location.longitude) {
                                            addMarkersToViewModels(awaitingAddUponLocationResponse, vm);
                                            if(vm === firstVM) {
                                                focusMapOnHomeowner(vm);
                                            }
                                        }
                                    }
                                }
                            }
                        });

                        _.forIn(extantGeoCodedVMsById, function (vm, key) {
                            if (!freshVMsById[key]) {
                                delete extantGeoCodedVMsById[key];
                                _.pull(self.vmsWithGeoData, vm);
                            }
                        });
                    });
            });
        }

        // Workaround for lazy loading of map the first time to avoid initial sizing troubles
        function refreshMapInOneTick() {
            return $timeout(function () {
                self.shouldShowMap = true;
            }, 1);
        }

        function searchButtonHandler() {
            googleMapsInitialized.then(function () {
                var input = document.getElementById('homeownerMapSearchBox');
                googleMaps.event.trigger(input, 'focus');
                googleMaps.event.trigger(input, 'keydown', {keyCode: 13});
                $timeout(function () {
                    _.noop();
                }, 10).then(function () {
                    self.map.zoom = defaultZoomLevel;
                });
            });

        }

        function navigateToFullMap() {
            $state.go('map');
        }

        function navigateToHomepage() {
            $state.go('homepage');
        }

        self.navigateToHomepage = navigateToHomepage;
        self.searchButtonHandler = searchButtonHandler;
        self.refreshMapInOneTick = refreshMapInOneTick;
        self.navigateToFullMap = navigateToFullMap;

        init();
    }

    function HomeownerWindowCtrl($scope) {
        $scope.editHomeownerFromWindow = function () {
            $scope.$parent.model.location.edit();
        };
    }

    angular
        .module('dealerportal.map', ['dealerportal.format', 'dealerportal.service'])
        .controller('HomeownerMapCtrl', ['$state', '$scope', '$timeout', 'uiGmapGoogleMapApi', 'homeownerService', 'homeownerModalService', HomeownerMapCtrl])
        .controller('HomeownerWindowCtrl', ['$scope', HomeownerWindowCtrl]);
})();
