'use strict';
(function () {

    function createApiWrapper($window) {
        var location = $window.location;
        var components = [location.protocol, '//', location.host, '/api'];
        var search = _(location.search.substring(1).split('&')).reduce(function splitParams(result, param) {
            param = param.split('=');
            result[param[0]] = param[1];
            return result;
        }, {});

        if (search.stub) {
            components.push('?stub=');
            components.push(search.stub);
        }

        return function wrapUrl(path) {
            var url = components.slice();
            url.splice(4, 0, path);
            return url.join('');
        };
    }
    
    function api(path, idProperty) {
        if(!idProperty) {
            idProperty = 'id';
        }        

        return function ($resource, apiUrl) {
            return $resource(apiUrl(path), {'id': '@' + idProperty}, {
                'login': { method: 'POST' },
                'save': { method: 'POST' },
                'update': { method: 'PUT' },
                // Yes, this is normally a response header. But it's what the
                // backend wants in order to get data directly from netsuite, foricbly
                // updating the cache.                
                'getNoCache': {method: 'GET', headers: {'Cache-Control': 'no-cache'}},
                'getTariffDetails': { method: 'POST' },
                'setTariffDetails': { method: 'PUT' },
                'getDistributorsBySuburb' : {method: 'POST'},
                'getTariffName' : {method: 'GET'},
                'getPaymentOptionValues' : {method: 'GET'},
                'getRetailersList' : {method: 'GET'},
                'getDistributorsByPostCode' : {method: 'GET'}                
            });
        };
    }

    angular
        .module('dealerportal.resource', ['ngResource'])
    /**
     * Forms an appropriate url to our API. Includes passing along the stub param to use the local file serving stub.
     */
        .factory('apiUrl',['$window', createApiWrapper])

    /**
     * Authenticate to the backend.
     */
        .factory('Login', ['$resource', 'apiUrl', api('/login')])

        .factory('PasswordReset', ['$resource', 'apiUrl', api('/resetpassword')])

    /**
     * Resource for creating, updating, and reading lists of homeowners.
     */
        .factory('Homeowner', ['$resource', 'apiUrl', api('/opportunities/:id', 'OpportunityId')])

        .factory('CreditCheck', ['$resource', 'apiUrl', api('/homeowners/:id/credit', 'SunEdCustId')])

        .factory('Opportunity', ['$resource', 'apiUrl', api('/tariff/:id', 'opportunityId')])

        .factory('TariffName', ['$resource', 'apiUrl', api('/tariff/names/:id', '')])

        .factory('TariffDetails', ['$resource', 'apiUrl', api('/tariff/:id', '')])

        .factory('Distributors', ['$resource', 'apiUrl', api('/distributors/:postCode', '')])

        .factory('PaymentPlan', ['$resource', 'apiUrl', api('/dataSource/dropDownListValues', '')])

        .factory('SaveOpportunity', ['$resource', 'apiUrl', api('/opportunity/:id', 'OpportunityId')])
        
        .factory('Retailers', ['$resource', 'apiUrl', api('/retailers/tariff/:id', 'Distributor')])
    ;
})();
