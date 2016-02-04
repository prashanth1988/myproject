/* global statusname */

'use strict';
(function () {
    function DashboardController($scope, localStorageService) {
        $scope.searchText = '';
        $scope.listOfSalesPeople = [];
        $scope.listOfPartners = [];
        $scope.listOfStatus = [];
        $scope.listOfSelectedSalesPeople = [];
        $scope.listOfSelectedPartners = [];
        $scope.listOfSelectedStatus = [];
        $scope.userRole = localStorageService.get('se-user').profile.Role;
        $scope.$on('listOfSalesPeople', function(event, listOfSalesPeople) {
            $scope.listOfSalesPeople = listOfSalesPeople;
            for(var i=0; i<$scope.listOfSalesPeople.length; i++){
                $scope.listOfSelectedSalesPeople.push($scope.listOfSalesPeople[i]);
            }
        });
        $scope.$on('listOfPartners', function(event, listOfPartners) {
            $scope.listOfPartners = listOfPartners;
            for(var i=0; i<$scope.listOfPartners.length; i++){
                $scope.listOfSelectedPartners.push($scope.listOfPartners[i]);
            }
        });
        $scope.editSelectedSalesPeople = function(salesPerson){
            var idx = $scope.listOfSelectedSalesPeople.indexOf(salesPerson);
            // is currently selected
            if (idx > -1) {
                $scope.listOfSelectedSalesPeople.splice(idx, 1);
            }
            // is newly selected
            else {
              $scope.listOfSelectedSalesPeople.push(salesPerson);
            }
        };
        $scope.editSelectedPartners = function(partner){
            var idx = $scope.listOfSelectedPartners.indexOf(partner);
            // is currently selected
            if (idx > -1) {
                $scope.listOfSelectedPartners.splice(idx, 1);
            }
            // is newly selected
            else {
              $scope.listOfSelectedPartners.push(partner);
            }
        };
        $scope.editSelectedStatus = function(status){
            var idx = $scope.listOfSelectedStatus.indexOf(status);
            // is currently selected
            if (idx > -1) {
                $scope.listOfSelectedStatus.splice(idx, 1);
            }
            // is newly selected
            else {
              $scope.listOfSelectedStatus.push(status);
            }
        };
    }
    
    
    angular
        .module('dealerportal.dashboard', [])
        .controller('DashboardController', ['$scope','localStorageService', DashboardController]);
})();
