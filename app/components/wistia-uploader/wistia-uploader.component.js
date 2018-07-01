function WistiaUploaderController($scope, wistiaService) {
    var ctrl = this;

    ctrl.progress = NaN;
    ctrl.err = null;
    ctrl.videoHashedId = null;

    // most used video file extensions, from https://en.wikipedia.org/wiki/Video_file_format
    var acceptFileTypes = /([./])(webm|mkv|flv|gif|avi|mov|qt|wmv|rm|rmvb|mp4|mpe?g)$/i;

    ctrl.$onInit = function () {
        var input = angular.element('.fileinput-button > input');
        input.fileupload({
            acceptFileTypes: acceptFileTypes,
            add: function (e, data) {
                var file = data.files[0];

                // the "acceptFileTypes" option seems not working, check it ourselves.
                // https://stackoverflow.com/q/17451629/474231
                if (!file || !acceptFileTypes.test(file.name)) {
                    ctrl.err = 'Please pick a video file to upload.';
                    $scope.$apply();
                } else {
                    wistiaService.uploadFile(file, function (e) {
                        ctrl.progress = Math.floor(e.loaded / e.total * 100);
                    }).then(function (res) {
                        // {data: {hashed_id: "2uxmpksi7r"}}
                        ctrl.videoHashedId = res.data.hashed_id;
                        ctrl.progress = NaN;
                        ctrl.err = null;
                    }, function (err) {
                        // {data: {error: "This account has exceeded its video limit..."}}
                        ctrl.err = 'Wistia: ' + err.data.error;
                        ctrl.progress = NaN;
                    });
                }

            }
        });
    };

    ctrl.closeAlert = function () {
        ctrl.err = null;
    };
}


angular.module('wistiaUploaderModule').component('wistiaUploader', {
    templateUrl: 'app/components/wistia-uploader/wistia-uploader.component.html',
    controller: ['$scope', 'wistiaService', WistiaUploaderController]
});
