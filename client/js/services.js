angular.module('proximate.services', [])

.factory('PubNub', function(pubNubKeys) {
  var pubNub = PUBNUB.init({
    publish_key: pubNubKeys.pub,
    subscribe_key: pubNubKeys.sub
  });

  var subscribe = function(channel, callback) {
    pubNub.subscribe({
      channel: channel,
      callback: callback
    });
  };

  var publish = function(channel, message) {
    var info = {
      channel: channel,
      message: message
    };

    pubNub.publish(info);
  };

  return {
    subscribe: subscribe,
    publish: publish
  };

})

.factory('Participant', function($http, $rootScope) {

  var getParticipantInfoFromId = function(participantId) {
    var url = '/api/participants/' + participantId;
    return $http({
      method: 'GET',
      url: url
    });
  };

  var getHistoryByParticipantId = function(participantId) {
    var url = '/api/participants/' + participantId + '/history';
    return $http({
      method: 'GET',
      url: url
    });
  };

  return {
    getParticipantInfoFromId: getParticipantInfoFromId,
    getHistoryByParticipantId: getHistoryByParticipantId
  };
})

.factory('Populate', function($http) {

  var adminId = 1;
  // get event participants for a given eventID
  var getParticipants = function(eventID) {
    var url = 'api/events/' + eventID + '/participants';
    return $http({
      method: 'GET',
      url: url,
    });
  };

  // get current event ID
  var getCurrentEvent = function(adminId) {
    var url = '/api/admins/' + adminId + '/events/current';
    return $http({
      method: 'GET',
      url: url,
    });
  };

  var getAdminName = function(adminId) {
    var url = '/api/admins/' + adminId;
    return $http({
      method: 'GET',
      url: url,
    });
  };

  var getEventsByAdminId = function(adminId) {
    var url = 'api/admins/' + adminId + '/events';
    return $http({
      method: 'GET',
      url: url,
    });
  };

  var getBeaconsByAdminId = function(adminId) {
    var url = '/api/admins/' + adminId + '/beacons';
    return $http({
      method: 'GET',
      url: url
    });
  };

  var postNewBeacon = function(adminId, identifier, uuid, major, minor) {
    return $http({
      method: 'POST',
      url: '/api/beacon/upsert',
      data: {
        adminId: adminId,
        identifier: identifier,
        uuid: uuid,
        major: major,
        minor: minor
      },
    });
  };

  var updateParticipantStatus = function(participantId, eventId, status) {
    return $http({
      method: 'Post',
      url: '/api/participant/updateStatus',
      data: {
        participantId: participantId,
        eventId: eventId,
        status: status
      },
    });
  };

  return {
    adminId: adminId,
    getParticipants: getParticipants,
    getCurrentEvent: getCurrentEvent,
    getAdminName: getAdminName,
    getEventsByAdminId: getEventsByAdminId,
    getBeaconsByAdminId: getBeaconsByAdminId,
    postNewBeacon: postNewBeacon,
    updateParticipantStatus: updateParticipantStatus
  };

})

.filter('fromNow', function($rootScope) {
  return function(startTime, endTime) {
    $rootScope.timeDiffLessThanHourBefore = false;
    $rootScope.timeDiffMoreThanHourBefore = false;
    $rootScope.timeDiffAfter = false;
    a = moment(startTime);
    b = moment(endTime);
    if (Math.abs(a.diff(b, 'minutes')) <= 60 && a.diff(b, 'minutes') > 0) {
      $rootScope.timeDiffLessThanHourBefore = true;
    } else if (Math.abs(a.diff(b, 'minutes')) > 60 && a.diff(b, 'minutes') > 0) {
      $rootScope.timeDiffMoreThanHourBefore = true;
    } else {
      $rootScope.timeDiffAfter = true;
    }
    return moment.duration(a - b).humanize(true);
  };
})

.filter('CurrentEvents', function($rootScope) {
  return function(events, current) {
    var filteredResults = [];
    var now = moment();
    if (events) {
      events.forEach(function(event) {
        if (current) {
          if (moment(event.start_time).diff(now) < 0) {
            return;
          }
        } else {
          if (moment(event.start_time).diff(now) >= 0) {
            return;
          }
        }
        filteredResults.push(event);
      });
    }
    return filteredResults;
  };
})

.filter('removeArrivedParticipants', function($rootScope) {
  return function(participants) {
    var filteredResults = [];
    if (participants) {
      participants.forEach(function(participant) {
        if (participant._pivot_status === 'ontime') {
          return;
        }
        filteredResults.push(participant);
      });
    }
    return filteredResults;
  };
});
