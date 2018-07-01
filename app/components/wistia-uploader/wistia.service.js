angular.module('wistiaUploaderModule').factory('wistiaService', ['$http', '$window', function($http, $window) {
    var url = 'https://upload.wistia.com';
    var token = 'aadc5b530773cc216c92d334181929333521e7bc4213d8b3b2cded5ff3e93939';

    // https://wistia.com/support/developers/upload-api
    this.uploadFile = function (file, progressCallback) {
        var form = new $window.FormData();
        form.append('file', file);
        form.append('api_password', token);

        return $http.post(url, form, {
            transformRequest: angular.identity,
            // https://stackoverflow.com/a/44726531/474231
            // It is important to set the content type header to undefined. Normally the $http service sets the content
            // type to application/json. When the content type is undefined, the XHR API will automatically set the
            // content type to multipart/form-data with the proper multi-part boundary.
            headers: {'Content-Type': undefined},
            uploadEventHandlers: {
                progress: function (e) {
                    if (e.lengthComputable && progressCallback) {
                        progressCallback(e);
                    }
                }
            }
        });
    };
    return this;
}]);
