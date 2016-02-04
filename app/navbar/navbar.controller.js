'use strict';

(function () {
    function NavbarCtrl($state, sessionService, homeownerService, homeownerModalService) {
        var self = this;

        self.logout = function () {
            sessionService.logout()
                    .then(function () {
                        $state.go('login');
                    });
        };

        self.openCreateLeadModal = function () {
            homeownerModalService.editHomeownerInModal(homeownerService.newHomeownerVM());
        };

        function goHome() {
            $state.go('homepage');
        }

        self.goHome = goHome;

        function setMenuInformation() {
            self.user = sessionService.user;
        }


        function init() {
            setMenuInformation();
        }



        init();
    }

    function ModalInstanceCtrl($log, $scope, $window, $location, $modalInstance, usStateList, auStateList, roofPitchList, roofTypeList, usSpinnerService, homeownerVM, homeownerService, GoogleMapApi, geoCodeService, modSolarModalService, proposalModalService, Opportunity, Distributors, TariffName, TariffDetails, PaymentPlan, $rootScope, billCycleTypeList, Retailers, managedModal) {
        var originalVM = homeownerVM,
                googleMaps,
                autocompleteInstance,
                googleMapsInitialized = GoogleMapApi.then(function (gmaps) {
                    googleMaps = gmaps;
                    return googleMaps;
                });

        $scope.saveLeadPhase1 = false;
        $scope.monthlyBreakdownCalculated = false;
        $scope.retailerTariffDetails;
        $scope.BillAmountValid = true;
        $scope.DailyKwhConsumptionValid = true;
        $scope.tariffNameInvalid = true;
        var originalHomeownerVM = _.cloneDeep(homeownerVM);
        $scope.homeownerVM = _.cloneDeep(homeownerVM);
        function showErrorDialog(message) {
            $log.info('Opening error modal');
            var modalInstance = managedModal.open({
                templateUrl: 'app/main/errorModal.html',
                size: 'lg',
                backdrop: 'static',
                controller: ['$scope', function ($scope) {
                    $scope.message = message;
                    $scope.dismiss = function () {
                        modalInstance.dismiss();
                    };
                }]
            });

            modalInstance.result.then(function () {
                $log.info('Error modal dismissed');
            });
        }

        /*PaymentPlan.getPaymentOptionValues().$promise
         .then(function (data) {
         $scope.tariffNames = [];
         for(var i=0; i<data.tariffName.length; i++){
         $scope.tariffNames[i] = data.tariffName[i].name;
         }                    
         $scope.tariffNamesNotAvailable = false;
         alert(data);
         })*/
        function getDistributorListBySuburb() {
            Distributors.getDistributorsBySuburb({Suburb: homeownerVM.model.Suburb}).$promise
                    .then(function (data) {
                        for (var i = 0; i < data.electricityDistributor.length; i++) {
                            $scope.electricityDistributorList[i] = data.electricityDistributor[i].name;
                        }
                        if($scope.homeownerVM.model.ElectricityDistributor){
                            $scope.getRetailerTariffDetailsByDistributor();
                        }
                    });
        }
        function getDistributorListByPostCode() {
            Distributors.getDistributorsByPostCode({postCode : homeownerVM.model.PostCode}).$promise
                    .then(function (data) {
                        $scope.electricityDistributorList = [];
                        for (var i = 0; i < data.electricityDistributor.length; i++) {
                            $scope.electricityDistributorList[i] = data.electricityDistributor[i].name;
                        }
                        if($scope.homeownerVM.model.ElectricityDistributor && $scope.electricityDistributorList.indexOf($scope.homeownerVM.model.ElectricityDistributor) > -1){
                            $scope.getRetailerTariffDetailsByDistributor();
                        }
                    })
                    .catch(function (error) {                   
                            if(!_.isEmpty(error.data.Message)){
                                showErrorDialog(error.data.Message);
                            }else{
                                showErrorDialog("We are currently experiencing technical error from Mule API. Please try again later. Thank you!");
                            }
                        });
        }        
        if (homeownerVM.model.OpportunityId) {
            $scope.operation = 'Update';
            $scope.isCreate = false;
            $scope.isUpdate = true;            
            if(!homeownerVM.model.Tariff.supplyChargeCents){
                homeownerVM.model.Tariff.supplyChargeCents = '0';
            }
            if(!homeownerVM.model.Tariff.shoulder1){
                homeownerVM.model.Tariff.shoulder1 = '0';
            }
            if(!homeownerVM.model.Tariff.peakOffpeakRate){
                homeownerVM.model.Tariff.peakOffpeakRate = '0';
            }
            if(!homeownerVM.model.Tariff.peakRate1){
                homeownerVM.model.Tariff.peakRate1 = '0';
            }
            if(!homeownerVM.model.Tariff.peakRate2){
                homeownerVM.model.Tariff.peakRate2 = '0';
            }
            if(!homeownerVM.model.Tariff.peakRate3){
                homeownerVM.model.Tariff.peakRate3 = '0';
            }
            if(!homeownerVM.model.Tariff.peakRate4){
                homeownerVM.model.Tariff.peakRate4 = '0';
            }
            if(!homeownerVM.model.Tariff.peakBlock1){
                homeownerVM.model.Tariff.peakBlock1 = '0';
            }
            if(!homeownerVM.model.Tariff.peakBlock2){
                homeownerVM.model.Tariff.peakBlock2 = '0';
            }
            if(!homeownerVM.model.Tariff.peakBlock3){
                homeownerVM.model.Tariff.peakBlock3 = '0';
            }
            if(!homeownerVM.model.Tariff.peakBlock4){
                homeownerVM.model.Tariff.peakBlock4 = '0';
            }
            if(!homeownerVM.model.SolarTariffRate.fitRate){
                homeownerVM.model.SolarTariffRate.fitRate = '0';
                $scope.homeownerVM.model.fitRate = '0';
                originalHomeownerVM.model.fitRate='0';
            }
            if(!homeownerVM.model.BillCycle || homeownerVM.model.BillCycle ===''){
                homeownerVM.model.BillCycle = 'Quarterly';
            }
        } else {
            $scope.operation = 'Create';
            $scope.isCreate = true;
            $scope.isUpdate = false;
        }

        $scope.leadFormInProcess = false;
        $scope.isProdEnv = true;
        $scope.tariffNamesNotAvailable = true;
        if ($location.host() !== 'partner.sunedison.com') {
            $scope.isProdEnv = false;
        }
        $scope.showTariffNameDropDown = false;
        $scope.getTariffInProcess = false;
        $scope.setTariffInProcess = false;

        $scope.spinnerOptions = {
            lines: 8, // The number of lines to draw
            length: 0, // The length of each line
            width: 4, // The line thickness
            radius: 5, // The radius of the inner circle
            corners: 1, // Corner roundness (0..1)
            rotate: 10, // The rotation offset
            direction: 1, // 1: clockwise, -1: counterclockwise
            color: '#FFF', // #rgb or #rrggbb or array of colors
            speed: 1.5, // Rounds per second
            trail: 0, // Afterglow percentage
            shadow: false, // Whether to render a shadow
            hwaccel: true, // Whether to use hardware acceleration
            className: 'spinner', // The CSS class to assign to the spinner
            zIndex: 2e9 // The z-index (defaults to 2000000000)
        };

        
        $scope.usStateList = usStateList;
        $scope.auStateList = auStateList;
        $scope.roofPitchList = roofPitchList;
        $scope.roofTypeList = roofTypeList;
        $scope.electricityDistributorList = [];
        $scope.electricityRetailerList = [];
        $scope.meterTypeList = [];
        $scope.billCycleTypeList = billCycleTypeList;
        $scope.tariffNames=[];
        if($scope.homeownerVM.displayPhase && $scope.homeownerVM.displayPhase === 'tariffDetails'){
            getDistributorListByPostCode();
        }

        $scope.stopSpinner = function () {
            $scope.leadFormInProcess = false;
            usSpinnerService.stop('modal-spinner');
        };

        $scope.startSpinner = function () {
            usSpinnerService.spin('modal-spinner');
        };

        function copyPhoneNumbersFromView() {
            $scope.homeownerVM.model.HomePhone = $scope.leadForm.HomePhone.$viewValue;
            //$scope.homeownerVM.model.CoHHomePhone = $scope.leadForm.CoHHomePhone.$viewValue;
            // $scope.homeownerVM.model.CellPhone = $scope.leadForm.CellPhone.$viewValue;
        }        
        $scope.ok = function () {
            $log.info('Saving lead ' + $scope.homeownerVM.model.FirstName + ' ' + $scope.homeownerVM.model.LastName);

            if ($scope.leadFormInProcess === true) {
                $log.info('Saving is in process.  Cannot execute save again.');
                return;
            }else if(_.isEqual(originalHomeownerVM.model, $scope.homeownerVM.model)){
                if($scope.homeownerVM.displayPhase === 'editOpportunity'){
                    $scope.homeownerVM.displayPhase = 'tariffDetails';
                    getDistributorListByPostCode();
                }
            }            
            else {
                $scope.leadFormInProcess = true;
                $scope.startSpinner();

                copyPhoneNumbersFromView();
                //copyEligibilityCriteriaFromView();
                homeownerService.updateFrom(originalVM, $scope.homeownerVM)
                        .then(function (updatedVM) {
                            
                            $scope.homeownerVM.location.latitude = updatedVM.location.latitude;
                            $scope.homeownerVM.location.longitude = updatedVM.location.longitude;
                            Distributors.getDistributorsByPostCode({postCode : homeownerVM.model.PostCode}).$promise
                                    .then(function (data) {
                                        var tempList = [];
                                        for (var i = 0; i < data.electricityDistributor.length; i++) {
                                            tempList[i] = data.electricityDistributor[i].name;
                                        }
                                        $scope.electricityDistributorList = tempList;
                                        if($scope.electricityDistributorList.indexOf($scope.homeownerVM.model.ElectricityDistributor) > -1){
                                            $scope.getRetailerTariffDetailsByDistributor();
                                        }
					setTimeout(function(){
                                            $scope.homeownerVM.location.latitude = updatedVM.location.latitude;
                                            $scope.homeownerVM.location.longitude = updatedVM.location.longitude;
					},3000);
                                        $scope.homeownerVM.displayPhase = 'tariffDetails';
                                        $scope.leadFormInProcess = false;									
                                        $scope.stopSpinner();
                                    });
                                    originalVM = homeownerVM;
                                    originalHomeownerVM = _.cloneDeep(updatedVM);
                                    originalHomeownerVM.model.CreationDate = '';
                        })
                        .catch(function () {
                            $scope.leadFormInProcess = false;									
                            $scope.stopSpinner();
                            $rootScope.$broadcast('backendError');
                        });
            }
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
            $window.location.reload();
        };

        $scope.openModSolarModal = function () {
            $modalInstance.dismiss('cancel');
            modSolarModalService.openModSolarModal();
        };

        function prepLatLongModel(latLng) {
            if (!$scope.homeownerVM.model.LatLng) {
                $scope.homeownerVM.model.LatLng = {
                    Lat: 0,
                    Lng: 0
                };
            }
            if ($scope.homeownerVM.model.LatLng && _.isObject($scope.homeownerVM.model.LatLng)) {
                if (!$scope.homeownerVM.model.LatLng.Lat) {
                    $scope.homeownerVM.model.LatLng.Lat = 0;
                }
                if (!$scope.homeownerVM.model.LatLng.Lng) {
                    $scope.homeownerVM.model.LatLng.Lng = 0;
                }
            }

            return latLng;
        }

        function initializeAddressAutoComplete() {
            googleMapsInitialized.then(function () {
                autocompleteInstance = new googleMaps.places.Autocomplete((document.getElementById('Street')), {types: ['geocode']});

                googleMaps.event.addListener(autocompleteInstance, 'place_changed', function () {
                    var place = autocompleteInstance.getPlace();
                    var addressModel = geoCodeService.parsePlaceObject(place);
                    geoCodeService
                            .latitudeAndLongitude(addressModel.Street, addressModel.City, addressModel.State, addressModel.Zip)
                            .then(prepLatLongModel)
                            .then(function (latLng) {
                                $scope.homeownerVM.model.LatLng.Lat = latLng.latitude;
                                $scope.homeownerVM.model.LatLng.Lng = latLng.longitude;
                            });
                    _.assign($scope.homeownerVM.model, addressModel);
                });
            });
        }

        function geolocate() {
            geoCodeService.geolocate()
                    .then(function (geolocation) {
                        var bounds = new googleMaps.LatLngBounds(geolocation, geolocation);
                        autocompleteInstance.setBounds(bounds);
                    });

        }

        $scope.openProposal = function () {
            $modalInstance.close();
            proposalModalService.openProposalModal($scope.homeownerVM);
        };

        $scope.getTariffName = function () {
            var payLoad = {};
            payLoad.ElectricityRetailer = $scope.homeownerVM.model.ElectricityRetailer;
            payLoad.ElectricityDistributor = $scope.homeownerVM.model.ElectricityDistributor;
            payLoad.MeterType = $scope.homeownerVM.model.MeterType;
            TariffName.getTariffName({retailerName: $scope.homeownerVM.model.ElectricityRetailer, distributorName: $scope.homeownerVM.model.ElectricityDistributor, meterType: $scope.homeownerVM.model.MeterType}).$promise
                    .then(function (data) {
                        $scope.tariffNames = [];
                        for (var i = 0; i < data.tariffName.length; i++) {
                            $scope.tariffNames[i] = data.tariffName[i].name;                            
                        }
                        $scope.showTariffNameDropDown = true;
                        $scope.leadFormInProcess = false;
                    })
                    .catch(function (error) {
                        $scope.stopSpinner();
                        $scope.leadFormInProcess = false;
                        if(!_.isEmpty(error.data.Message)){
                            showErrorDialog(error.data.Message);
                        }else{
                            showErrorDialog("We are currently experiencing technical error from Mule API. Please try again later. Thank you!");
                        }
                    });
        };

        $scope.getTariffDetails = function () {
            $scope.getTariffInProcess = true;
            var payLoad = {};
            payLoad.BillOrEstimate = $scope.homeownerVM.model.BillOrEstimate;
            payLoad.ElectricityBillCycle = $scope.homeownerVM.model.BillCycle;
            payLoad.MeterType = $scope.homeownerVM.model.MeterType;
            payLoad.ElectricityRetailer = $scope.homeownerVM.model.ElectricityRetailer;
            payLoad.TariffNameId = $scope.homeownerVM.model.TariffId;
            payLoad.ElectricityDistributor = $scope.homeownerVM.model.ElectricityDistributor;
            payLoad.OpportunityId = $scope.homeownerVM.model.OpportunityId;
            TariffDetails.getTariffDetails(payLoad).$promise
                    .then(function (response) {
                        $scope.homeownerVM.model.Tariff.supplyChargeCents = response.supplyChargeCents;
                        $scope.homeownerVM.model.Tariff.timeStructure = response.timeStructure;
                        $scope.homeownerVM.model.Tariff.peakRate1 = response.peakRate1;
                        $scope.homeownerVM.model.Tariff.peakRate2 = response.peakRate2;
                        $scope.homeownerVM.model.Tariff.peakRate3 = response.peakRate3;
                        $scope.homeownerVM.model.Tariff.peakRate4 = response.peakRate4;
                        $scope.homeownerVM.model.Tariff.peakBlock1 = response.peakBlock1;
                        $scope.homeownerVM.model.Tariff.peakBlock2 = response.peakBlock2;
                        $scope.homeownerVM.model.Tariff.peakBlock3 = response.peakBlock3;
                        $scope.homeownerVM.model.Tariff.peakBlock4 = response.peakBlock4;
                        $scope.homeownerVM.model.Tariff.shoulder1 = response.shoulder1;
                        $scope.homeownerVM.model.Tariff.peakOffpeakRate = response.peakOffpeakRate;
                        $scope.homeownerVM.model.SolarTariffRate.fitRate = response.fitRate;
                        $scope.monthlyBreakdownCalculated = true;
                        $scope.getTariffInProcess = false;
                    })
                    .catch(function (error) {
                        $scope.stopSpinner();
                        $scope.leadFormInProcess = false;
                        $scope.getTariffInProcess = false;
                        if(!_.isEmpty(error.data.Message)){
                            showErrorDialog(error.data.Message);
                        }else{
                            showErrorDialog("We are currently experiencing technical error from Mule API. Please try again later. Thank you!");
                        }
                    });
        };

        $scope.setTariffDetails = function (homeownerVM) {
            $scope.setTariffInProcess = true;
            $scope.startSpinner();

            var payLoad = {};
            payLoad.BillOrEstimate = $scope.homeownerVM.model.BillOrEstimate;
            if($scope.homeownerVM.model.DailyKwhConsumption)
                payLoad.DailyKwhConsumption = $scope.homeownerVM.model.DailyKwhConsumption;
            else
                payLoad.DailyKwhConsumption = "0";
            if($scope.homeownerVM.model.BillAmount)
                payLoad.BillAmount = $scope.homeownerVM.model.BillAmount;
            else
                payLoad.BillAmount = "0";
            payLoad.ElectricityBillCycle = $scope.homeownerVM.model.BillCycle;
            payLoad.MeterType = $scope.homeownerVM.model.MeterType;
            payLoad.ElectricityRetailer = $scope.homeownerVM.model.ElectricityRetailer;
            payLoad.TariffNameId = $scope.homeownerVM.model.TariffId;
            payLoad.ElectricityDistributor = $scope.homeownerVM.model.ElectricityDistributor;
            payLoad.OpportunityId = $scope.homeownerVM.model.OpportunityId;
            payLoad.supplyChargeCents = $scope.homeownerVM.model.Tariff.supplyChargeCents;
            payLoad.timeStructure = $scope.homeownerVM.model.Tariff.timeStructure;
            payLoad.peakRate1 = $scope.homeownerVM.model.Tariff.peakRate1;
            payLoad.peakRate2 = $scope.homeownerVM.model.Tariff.peakRate2;
            payLoad.peakRate3 = $scope.homeownerVM.model.Tariff.peakRate3;
            payLoad.peakRate4 = $scope.homeownerVM.model.Tariff.peakRate4;
            payLoad.peakRate5 = $scope.homeownerVM.model.Tariff.peakRate5;
            payLoad.peakBlock1 = $scope.homeownerVM.model.Tariff.peakBlock1;
            payLoad.peakBlock2 = $scope.homeownerVM.model.Tariff.peakBlock2;
            payLoad.peakBlock3 = $scope.homeownerVM.model.Tariff.peakBlock3;
            payLoad.peakBlock4 = $scope.homeownerVM.model.Tariff.peakBlock4;
            payLoad.shoulder1 = $scope.homeownerVM.model.Tariff.shoulder1;
            payLoad.peakOffpeakRate = $scope.homeownerVM.model.Tariff.peakOffpeakRate;
            payLoad.fitRate = $scope.homeownerVM.model.SolarTariffRate.fitRate;
            
            originalHomeownerVM.model.TariffId = $scope.homeownerVM.model.TariffId;
            if(_.isEqual(originalHomeownerVM.model, $scope.homeownerVM.model)){
                if($scope.homeownerVM.displayPhase !== 'editOpportunity'){
                    $scope.openProposal(homeownerVM);
                }
            }
            else{
                TariffDetails.setTariffDetails(payLoad).$promise
                        .then(function () {                        
                            $scope.leadFormInProcess = false;
                            $scope.setTariffInProcess = false;
                            if($scope.homeownerVM.displayPhase !== 'editOpportunity'){
                                $scope.openProposal(homeownerVM);
                            }
                        })
                        .catch(function (error) {
                            $scope.stopSpinner();
                            $scope.leadFormInProcess = false;
                            $scope.setTariffInProcess = false;
                            if(!_.isEmpty(error.data.Message)){
                                showErrorDialog(error.data.Message);
                            }else{
                                showErrorDialog("We are currently experiencing technical error from Mule API. Please try again later. Thank you!");
                            }                        
                        });
            }
        };

        $scope.getRetailerTariffDetailsByDistributor = function () {
            $scope.electricityRetailerList = [];
            Retailers.getRetailersList({distributorName: $scope.homeownerVM.model.ElectricityDistributor}).$promise
                    .then(function (data) {
                        $scope.retailerTariffDetails = data;                        
                        for (var i = 0; i < $scope.retailerTariffDetails.retailers.length; i++) {
                            $scope.electricityRetailerList.push($scope.retailerTariffDetails.retailers[i].retailer);
                        }
                        $scope.getMeterTypeByRetailer();
                        //$scope.getTariffNamesByMeterType();
                        $scope.showTariffNameDropDown = true;
                        $scope.leadFormInProcess = false;
                    })
                    .catch(function (error) {
                        $scope.stopSpinner();
                        $scope.leadFormInProcess = false;
                        if(!_.isEmpty(error.data.Message)){
                            showErrorDialog(error.data.Message);
                        }else{
                            showErrorDialog("We are currently experiencing technical error from Mule API. Please try again later. Thank you!");
                        }
                    });
        };

        $scope.getMeterTypeByRetailer = function () {
            $scope.meterTypeList = [];
            for (var i = 0; i < $scope.retailerTariffDetails.retailers.length; i++) {
                if ($scope.retailerTariffDetails.retailers[i].retailer === $scope.homeownerVM.model.ElectricityRetailer) {
                    for (var j = 0; j < $scope.retailerTariffDetails.retailers[i].meterTypes.length; j++) {
                        $scope.meterTypeList.push($scope.retailerTariffDetails.retailers[i].meterTypes[j].meterType);
                    }
                }
            }
            $scope.getTariffNamesByMeterType();
        };

        $scope.getTariffNamesByMeterType = function () {
            $scope.tariffNames = [];
            var tariffIDMatched = false;
            for (var i = 0; i < $scope.retailerTariffDetails.retailers.length; i++) {
                if ($scope.retailerTariffDetails.retailers[i].retailer === $scope.homeownerVM.model.ElectricityRetailer) {
                    for (var j = 0; j < $scope.retailerTariffDetails.retailers[i].meterTypes.length; j++) {
                        if ($scope.retailerTariffDetails.retailers[i].meterTypes[j].meterType === $scope.homeownerVM.model.MeterType) {
                            for (var k = 0; k < $scope.retailerTariffDetails.retailers[i].meterTypes[j].tariffNames.length; k++) {
                                $scope.tariffNames.push($scope.retailerTariffDetails.retailers[i].meterTypes[j].tariffNames[k]);
                                if($scope.retailerTariffDetails.retailers[i].meterTypes[j].tariffNames[k].name === $scope.homeownerVM.model.TariffName){
                                    $scope.homeownerVM.model.TariffId = $scope.retailerTariffDetails.retailers[i].meterTypes[j].tariffNames[k].id;
                                    originalHomeownerVM.model.TariffId = $scope.homeownerVM.model.TariffId;
                                    tariffIDMatched = true;
                                }
                            }
                            if(!tariffIDMatched){
                                $scope.homeownerVM.model.TariffId = null;
                            }
                        }
                    }
                }
            }
            $scope.isTariffNameValid();
        };

        $scope.validateDailyKwhConsumption = function(valuePassed){
            if(typeof valuePassed !== 'undefined' && valuePassed.trim() !== '' && (isNaN(valuePassed) || !parseFloat(valuePassed) > 0)){
                $scope.DailyKwhConsumptionValid = false;
            }else{
                $scope.DailyKwhConsumptionValid = true;
            }                
        };
        $scope.validateBillAmount = function(valuePassed){
            if(typeof valuePassed !== 'undefined' && valuePassed.trim() !== '' && (isNaN(valuePassed) || !parseFloat(valuePassed) > 0)){
                $scope.BillAmountValid = false;
            }else{
                $scope.BillAmountValid = true;
            }                
        };
        $scope.getDefaultBillCycleType = function(){
            if($scope.homeownerVM.model.BillOrEstimate === 'I have a Bill'){
                $scope.homeownerVM.model.BillCycle = 'Yearly';
            }else{
                $scope.homeownerVM.model.BillCycle = 'Quarterly';
            }
        };
        $scope.changeDisplayPhase = function(){
            $scope.homeownerVM.displayPhase = 'editOpportunity';
        };
        $scope.isTariffNameValid = function(){
            $scope.tariffNameInvalid = true;
            for(var i=0; i<$scope.tariffNames.length; i++){
                if($scope.homeownerVM.model.TariffName === $scope.tariffNames[i].name){
                    $scope.tariffNameInvalid = false;
                }
            }
        };
        
        $scope.geolocate = geolocate;
        $scope.initializeAddressAutoComplete = initializeAddressAutoComplete;
    }



    angular
            .module('dealerportal.nav', ['dealerportal.service', 'ui.router', 'ui.bootstrap'])
            .controller('NavbarCtrl', ['$state', 'sessionService', 'homeownerService', 'homeownerModalService', NavbarCtrl])
            .controller('ModalInstanceCtrl', ['$log', '$scope', '$window', '$location', '$modalInstance', 'usStateList', 'auStateList', 'roofPitchList', 'roofTypeList', 'usSpinnerService', 'homeownerVM', 'homeownerService', 'uiGmapGoogleMapApi', 'geoCodeService', 'modSolarModalService', 'proposalModalService', 'Opportunity', 'Distributors', 'TariffName', 'TariffDetails', 'PaymentPlan', '$rootScope', 'billCycleTypeList', 'Retailers', 'managedModal', ModalInstanceCtrl]);
})();
