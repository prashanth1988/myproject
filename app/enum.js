/**
 * Created by jamesonnyeholt2 on 10/27/14.
 */

'use strict';
(function () {
  var usStateList = [
      'Alabama',
      'Alaska',
      'Arizona',
      'Arkansas',
      'California',
      'Colorado',
      'Connecticut',
      'Delaware',
      'Florida',
      'Georgia',
      'Hawaii',
      'Idaho',
      'Illinois',
      'Indiana',
      'Iowa',
      'Kansas',
      'Kentucky',
      'Louisiana',
      'Maine',
      'Maryland',
      'Massachusetts',
      'Michigan',
      'Minnesota',
      'Mississippi',
      'Missouri',
      'Montana',
      'Nebraska',
      'Nevada',
      'New Hampshire',
      'New Jersey',
      'New Mexico',
      'New York',
      'North Carolina',
      'North Dakota',
      'Ohio',
      'Oklahoma',
      'Oregon',
      'Pennsylvania',
      'Rhode Island',
      'South Carolina',
      'South Dakota',
      'Tennessee',
      'Texas',
      'Utah',
      'Vermont',
      'Virginia',
      'Washington',
      'West Virginia',
      'Wisconsin',
      'Wyoming'
    ],
    ukStateList = [
      'Bedfordshire',
      'Berkshire',
      'Buckinghamshire',
      'Cambridgeshire',
      'Cheshire',
      'Cornwall',
      'Cumbria',
      'Derbyshire',
      'Devon',
      'Dorset',
      'Durham',
      'Essex',
      'Gloucestershire',
      'Hampshire'
    ],
    auStateList = [
      'Australian Capital Territory',
      'New South Wales',
      'Northern Territory',
      'Queensland',
      'South Australia',
      'Tasmania',
      'Victoria',
      'Western Australia'
    ],
    roofPitchList = [
        'Flat',
        'Pitched'
    ],
    roofTypeList = [
        'Cliplock',
        'Tile',
        'Tin / Colorbond'
    ],
    /*electricityDistributorList = [
       'ACTEW AGL',
       'AGL ASSIST',
       'AURORA',
       'AUSGRID',
       'CITIPOWER',
       'ENDEAVOUR ENERGY',
       'ENERGEX',
       'ERGON',
       'ESSENTIAL ENERGY',
       'HORIZON POWER',
       'JEMENA',
       'POWER AND WATER CORP',
       'POWERCOR',
       'SA POWER NETWORKS',
       'SP AUSNET',
       'SYNERGY',
       'WESTERN POWER'
    ],
    electricityRetailerList = [
        'ACTEW AGL',
        'AGL',
        'ALINTA ENERGY',
        'AURORA',
        'AUSTRALIAN POWER & GAS',
        'CLICK ENERGY',
        'COMMANDER',
        'COUNTRY ENERGY',
        'DIAMOND',
        'DODO POWER & GAS',
        'ENERGY AUSTRALIA (PRE ENERGYAUSTRALIA)',
        'ENERGYAUSTRALIA (FMRLY TRU)',
        'ERGON',
        'HORIZON POWER',
        'JACANDA',
        'LUMO ENERGY',
        'MOMENTUM ENERGY',
        'NEIGHBOURHOOD ENERGY',
        'ORIGIN ENERGY',
        'PACIFIC HYDRO',
        'PEOPLE ENERGY',
        'POWERDIRECT',
        'POWERSHOP',
        'QENERGY',
        'RED ENERGY',
        'SIMPLY ENERGY',
        'SYNERGY'
    ],
    meterTypeList = [
        'Single Rate',
        'Time of Use',
        'Two Rate',
        'Controlled'
    ],*/
    billCycleTypeList = [
        'Yearly',
        'Quarterly',
        'Monthly'        
    ],
    snapflowConstants = {
      EVENT: {
        USER_LOGIN: 'EVENT_USER_LOGIN',
        USER_LOGOUT: 'EVENT_USER_LOGOUT',
        APPLICATION_ERROR: 'EVENT_APPLICATION_ERROR'
      },
      ERROR: {
        REQUIRES_AUTHENTICATION: 'REQUIRES_AUTHENTICATION',
        REQUIRES_TENANT_IN_URL: 'REQUIRES_TENANT_IN_URL',
        UNKNOWN_TENANT: 'UNKNOWN_TENANT'
      }
    };


  angular.module('dealerportal.enum', [])
    .constant('snapflowConstant', snapflowConstants)
    .constant('usStateList', usStateList)
    .constant('ukStateList', ukStateList)
    .constant('auStateList', auStateList)
    .constant('roofPitchList', roofPitchList)
    .constant('roofTypeList', roofTypeList)
    //.constant('electricityDistributorList', electricityDistributorList)
    //.constant('electricityRetailerList', electricityRetailerList)
    //.constant('meterTypeList', meterTypeList)
    .constant('billCycleTypeList', billCycleTypeList);
})();
