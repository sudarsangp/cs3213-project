'use strict';

/**
 * @ngdoc function
 * @name frontendApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the frontendApp
 */
angular.module('frontendApp')
  .controller('MainCtrl',
    function($scope, $timeout, Facebook, Gamer) {

      //============= FACEBOOK ============//
      $scope.user = {};
      $scope.logged = false;
      $scope.waiting = true;

      $scope.byebye = false;
      $scope.greeting = false;

      $scope.$watch(
        function() {
          return Facebook.isReady();
        },
        function(newVal) {
          if (newVal) {
            $scope.facebookReady = true;
          }
        }
      );

      var userIsConnected = false;

      Facebook.getLoginStatus(function(response) {
        $scope.waiting = false;
        if (response.status == 'connected') {
          userIsConnected = true;
          $scope.logged = true;
          $scope.me();
        }
      });

      $scope.IntentLogin = function() {
        if(!userIsConnected) {
          $scope.login();
        }
      };

     $scope.login = function() {
       Facebook.login(function(response) {
        if (response.status == 'connected') {
          $scope.logged = true;
          $scope.me();
        }
      });
     };

      $scope.me = function() {
        Facebook.api('/me', function(response) {
          $scope.$apply(function() {
            $scope.user = response;
          });
          $scope.dbFetch();
        });
      };

      $scope.dbFetch = function() {

        var gamer = Gamer.findOne(
          {
            filter: {
              where: {facebookId: $scope.user.id},
              include: 'programs'
            }
          }, function success (val, res) {
            $scope.gamer = gamer;
            console.log('success');
          }, function error (res) {

            var data = {
              'facebookId': $scope.user.id,
              'username' : $scope.user.name,
              'lastLevelCompleted': 1
            };

            $scope.gamer = Gamer.create(data);
            console.log('user is not in database. created new user.');
          }
        );
      };

      $scope.logout = function() {
        Facebook.logout(function() {
          $scope.$apply(function() {
            $scope.user   = {};
            $scope.logged = false;
            userIsConnected = false;
          });
        });
      };

      $scope.$on('Facebook:statusChange', function(ev, data) {
        if (data.status == 'connected') {
          $scope.$apply(function() {
            $scope.greeting = true;
            $scope.byebye     = false;
          });
        } else {
          $scope.$apply(function() {
            $scope.greeting = false;
            $scope.byebye     = true;

            $timeout(function() {
              $scope.byebye = false;
            }, 2000);
          });
        }
      });
    }
);
