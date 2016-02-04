'use strict';
(function () {
    function HomeownerList(managedModal, $scope, $log, CreditCheck, $rootScope, usSpinnerService, $location, $window, homeownerService, homeownerModalService, modSolarModalService, supportMsgModalService, proposalModalService, localStorageService) {
        var self = this;
        $scope.isProdEnv = true;
        self.reverse = true;
        self.openProposalDropdownID = '';
        self.loading = true;
        self.salesPersonId = localStorageService.get('se-user').profile.NSInternalId;
        self.partnerId = localStorageService.get('se-user').profile.PartnerId;
        self.userRole = localStorageService.get('se-user').profile.Role;
        self.order = function (field) {
            self.changeClass(field);
            self.viewModels = self.orderBy(self.viewModels, field);
        };

        self.orderBy = function (items, field) {
            items.sort(function (a, b) {
                if (a.model[field] && b.model[field]) {
                    return (a.model[field].toUpperCase() > b.model[field].toUpperCase() ? 1 : -1);
                }
            });
            if (self.reverse) {
                items.reverse();
            }
            self.reverse = !self.reverse;
            return items;
        };

        self.openProposals = function (event, homeOwnerID) {
            if (self.openProposalDropdownID === homeOwnerID) {
                $('#' + self.openProposalDropdownID).hide();
                self.openProposalDropdownID = '';
                event.stopPropagation();
            } else {
                $('#' + self.openProposalDropdownID).hide();
                self.openProposalDropdownID = homeOwnerID;
                event.stopPropagation();
                $('#' + homeOwnerID).toggle();
            }
        };

        self.changeClass = function (field) {
            self.classForFN = 'defaultSortColumn';
            self.classForLN = 'defaultSortColumn';
            self.classForHomePhone = 'defaultSortColumn';
            self.classForStreet = 'defaultSortColumn';
            self.classForCity = 'defaultSortColumn';
            self.classForState = 'defaultSortColumn';
            self.classForZip = 'defaultSortColumn';
            self.classForDateCreated = 'defaultSortColumn';
            self.classForLeadSource = 'defaultSortColumn';
            self.classForExpCloseDate = 'defaultSortColumn';
            self.classForStatus = 'defaultSortColumn';
            if (field === 'FirstName') {
                self.classForFN = 'highlightSortColumn';
            }
            else if (field === 'LastName') {
                self.classForLN = 'highlightSortColumn';
            }
            else if (field === 'HomePhone') {
                self.classForHomePhone = 'highlightSortColumn';
            }
            else if (field === 'Street') {
                self.classForStreet = 'highlightSortColumn';
            }
            else if (field === 'City') {
                self.classForCity = 'highlightSortColumn';
            }
            else if (field === 'State') {
                self.classForState = 'highlightSortColumn';
            }
            else if (field === 'Zip') {
                self.classForZip = 'highlightSortColumn';
            }
            else if (field === 'DateCreated') {
                self.classForDateCreated = 'highlightSortColumn';
            }
            else if (field === 'LeadSource') {
                self.classForLeadSource = 'highlightSortColumn';
            }
            else if (field === 'ExpCloseDate') {
                self.classForExpCloseDate = 'highlightSortColumn';
            }
            else if (field === 'Status') {
                self.classForStatus = 'highlightSortColumn';
            }
        };

        self.spinnerOptions = {
            lines: 8, // The number of lines to draw
            length: 0, // The length of each line
            width: 4, // The line thickness
            radius: 7, // The radius of the inner circle
            corners: 1, // Corner roundness (0..1)
            rotate: 10, // The rotation offset
            direction: 1, // 1: clockwise, -1: counterclockwise
            color: '#333', // #rgb or #rrggbb or array of colors
            speed: 1.5, // Rounds per second
            trail: 0, // Afterglow percentage
            shadow: false, // Whether to render a shadow
            hwaccel: true, // Whether to use hardware acceleration
            className: 'spinner', // The CSS class to assign to the spinner
            zIndex: 2e9 // The z-index (defaults to 2000000000)
        };

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

        function editHomeownerInModal(homeownerVM) {
            homeownerVM.displayPhase = 'editOpportunity';
            var modalInstance = homeownerModalService.editHomeownerInModal(homeownerVM);
            modalInstance.result
                    .then(function (selectedItem) {
                        $scope.selected = selectedItem;
                    }, function () {
                        $log.info('Create lead modal dismissed');
                    });
        }

        function addProposal(homeownerVM) {
            homeownerVM.displayPhase = 'tariffDetails';
            var modalInstance = homeownerModalService.editHomeownerInModal(homeownerVM);
            modalInstance.result
                    .then(function (selectedItem) {
                        $scope.selected = selectedItem;
                    }, function () {
                        $log.info('Tariff Details modal dismissed');
                    });
        }

        function showProposals(homeownerVM) {
            proposalModalService.openProposalModal(homeownerVM, 'showProposals');
        }
        ;

        self.editHomeownerInModal = editHomeownerInModal;
        self.openModSolarModal = modSolarModalService.openModSolarModal;
        self.openCallSupportMsgInModal = supportMsgModalService.openCallSupportMsgInModal;
        self.addProposal = addProposal;
        self.showProposals = showProposals;

        function init() {
            //Okta redirect to be done through a relative path through a proxy later.
            homeownerService.getHomeownerViewModels().then(function (vms) {
                self.viewModels = vms;
                self.listOfSalesPeople = [];
                self.listOfPartners = [];
                self.listOfStatus = [{statuscode: "10", statusname: "Engagement"},{statuscode: "11", statusname: "Contract"},{statuscode: "13", statusname: "Won"},
                    {statuscode: "14", statusname: "Closed Lost"},{statuscode: "24", statusname: "Unqualified"},{statuscode: "39", statusname: "Decision"},{statuscode: "44", statusname: "Proposal"}];
                if (self.userRole === 'PartnerAdmin') {
                    for (var i = 0; i < vms.length; i++) {
                        if (self.listOfSalesPeople.indexOf(vms[i].model.SalesPersonId) === -1) {
                            self.listOfSalesPeople.push(vms[i].model.SalesPersonId);
                        }
                    }
                    $rootScope.$broadcast('listOfSalesPeople', self.listOfSalesPeople);
                } else if (self.userRole === 'SalesPerson') {
                    for (var i = 0; i < vms.length; i++) {
                        if (self.listOfPartners.indexOf(vms[i].model.PartnerId) === -1) {
                            self.listOfPartners.push(vms[i].model.PartnerId);
                        }
                    }
                    $rootScope.$broadcast('listOfPartners', self.listOfPartners);
                }
                for (var i = 0; i < vms.length; i++) {
                    if (self.listOfStatus.indexOf(vms[i].model.Status) === -1) {
                        self.listOfStatus.push(vms[i].model.Status);
                    }
                }
                $rootScope.$broadcast('listOfStatus', self.listOfStatus);

                self.loading = false;

            });

            if ($location.host() !== 'partner.sunedison.com') {
                $scope.isProdEnv = false;
            }
        }

        function stopSpinner(spinnerId) {
            return usSpinnerService.stop(spinnerId);
        }

        function startSpinner(spinnerId) {
            return usSpinnerService.spin(spinnerId);
        }

        function initiateCreditCheck(homeownerVM) {
            if (!homeownerVM || !homeownerVM.model || !homeownerVM.model.SunEdCustId) {
                $log.error('The homeowner id was not present.  Cannot begin the credit check.');
                return;
            }

            if (homeownerVM.creditCheckInProcess) {
                $log.warn('Credit check is currently in process.  Cannot activate again.');
                return;
            }

            homeownerVM.creditCheckInProcess = true;
            startSpinner(homeownerVM.model.SunEdCustId);

            CreditCheck.save({'SunEdCustId': homeownerVM.model.SunEdCustId}).$promise
                    .then(function (data) {
                        // Note that the returned data tracks the user id via the HomeOwnerID property
                        // whereas the actual homeowner endpoint models use the SunEdCustId property.
                        $log.log('Successfully submitted the credit check update event for homeowner: ' + data.HomeOwnerID);
                        return homeownerService.pollHomeownerUntilCreditStatusExists(homeownerVM);
                    })
                    .then(function () {
                        delete homeownerVM.creditCheckInProcess;
                        stopSpinner(homeownerVM.model.SunEdCustId);
                    })
                    .catch(function (e) {
                        $log.error(e);
                        $rootScope.$broadcast('backendError', e);
                        delete homeownerVM.creditCheckInProcess;
                        stopSpinner(homeownerVM.model.SunEdCustId);
                    });
        }

        function initiateProposal() {
            $log.warn('This event has not been implemented yet due to lack of API documentation.');
        }

        self.initiateCreditCheck = initiateCreditCheck;
        self.initiateProposal = initiateProposal;

        $scope.$on('backendError', function (event, error) {
            var message;
            if (typeof (error) === 'object') {
                if (error.data.Message && error.data.SystemFailed) {
                    message = error.data.Message;
                } else if (error.status && error.data) {
                    message = 'Received error from the server, http status ' + error.status + ':\n' + JSON.stringify(error.data);
                }
                else {
                    message = JSON.stringify(error);
                }
            }
            else {
                message = error;
            }
            if (!_.isEmpty(message)) {
                showErrorDialog(message);
            }
        });

        init();
    }

    angular
            .module('dealerportal.homeowner', ['dealerportal.format', 'dealerportal.service', 'ui.bootstrap'])
            .controller('HomeownerList', ['managedModal', '$scope', '$log', 'CreditCheck', '$rootScope', 'usSpinnerService', '$location', '$window', 'homeownerService', 'homeownerModalService', 'modSolarModalService', 'supportMsgModalService', 'proposalModalService', 'localStorageService', HomeownerList]);
})();
