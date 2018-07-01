angular.module('wistiaUploaderModule').factory('wistiaService', ['$http', function($http) {
    var url = 'https://upload.wistia.com';
    var token = 'aadc5b530773cc216c92d334181929333521e7bc4213d8b3b2cded5ff3e93939';

    // https://wistia.com/support/developers/upload-api
    this.uploadFile = function (file, progressCallback) {
        var form = new FormData();
        form.append('file', file);
        form.append('api_password', token);

        return $http.post(url, form, {
            transformRequest: angular.identity,
            headers: {'Content-Type': 'multipart/form-data'},
            uploadEventHandlers: {
                progress: function (e) {
                    if (e.lengthComputable && progressCallback) {
                        progressCallback(e);
                    }
                }
            }
        })
    };
    return this;
}]);
