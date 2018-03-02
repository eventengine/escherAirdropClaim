//main.js
angular
.module('app')
.controller('usersTableCtrl', usersTableCtrl)
.controller('contractCtrl', contractCtrl);

//convert Hex to RGBA
function convertHex(hex,opacity){
  hex = hex.replace('#','');
  r = parseInt(hex.substring(0,2), 16);
  g = parseInt(hex.substring(2,4), 16);
  b = parseInt(hex.substring(4,6), 16);

  result = 'rgba('+r+','+g+','+b+','+opacity/100+')';
  return result;
}

function random(min,max) {
  return Math.floor(Math.random()*(max-min+1)+min);
}

usersTableCtrl.$inject = ['$scope', '$http', '$timeout'];
function usersTableCtrl($scope, $http, $timeout) {

  $http.get('https://escherdrop.ubiqscan.io/getclaims/0xd884cD05a38A64239c430eD2eF83df20E496aCE4').
    then(function(success) {
      var barData = success.data;
      if (barData.length > 30) {
        barData = barData.slice(barData.length - 30);
      }
      var barChart = {
        data: [],
        labels: [],
        options: {
          scales: {
              xAxes: [{
                  display: false
              }]
          }
        }
      }
      barData.forEach(function(claim) {
        barChart['data'].push(claim.balance);
        barChart['labels'].push(claim.address);
      });
      $scope.bar = barChart;
      $scope.users = success.data;
      $scope.users.reverse();
      $scope.users.forEach(function(claim) {
        claim.escher = (claim.balance * 12).toFixed(8);
      })
    }, function(error) {
      // log error
    });
}

contractCtrl.$inject = ['$scope', '$http', '$timeout'];
function contractCtrl($scope, $http, $timeout) {
  $http.get('https://escherdrop.ubiqscan.io/getairdrop/0xd884cD05a38A64239c430eD2eF83df20E496aCE4').
    then(function(success) {
      $scope.airdrop = success.data;
      $scope.progress = {
        percent: (success.data['lastBlock'] - success.data['startBlock']) / (success.data['endBlock'] - success.data['startBlock']) * 100
      }
      $http.get('https://api1.ubiqscan.io/v2/getsupply').
        then(function(success_) {
          var percentClaimed = ((success.data.totalClaimed / success_.data.result) * 100).toFixed(4);
          $scope.pie = {
            labels: ['Claimed', 'Unclaimed'],
            data: [percentClaimed, (100 - percentClaimed)]
          };
        }, function(error_) {
          console.log('unable to get total supply from ubiqscan api.');
        })
    }, function(error) {
      // log error
    });

  $scope.abi = {
    json:'[{"constant":true,"inputs":[],"name":"endBlock","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"claimersCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"startBlock","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"claim","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"offset","type":"uint256"},{"name":"limit","type":"uint256"}],"name":"getClaimers","outputs":[{"name":"_claimers","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"claimers","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"claims","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_startBlock","type":"uint256"},{"name":"_endBlock","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"claimer","type":"address"}],"name":"onClaim","type":"event"}]'
  }

  $scope.clipboardSuccess = function(e) {
    $scope.showClipboardNotification = true;
    setTimeout(function(){ //wait 3 seconds and toggle back to false
      $scope.showClipboardNotification = false;
    }, 3000);
  }
}
