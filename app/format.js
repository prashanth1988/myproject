'use strict';
(function() {
  function formatAddress(address) {
    return _.compact([address.StreetNumAndName, address.Suburb, address.PostCode]).join(', ');
  }

  angular.module('dealerportal.format', [])
    .filter('asAddress' , function() { return formatAddress; });
})();
