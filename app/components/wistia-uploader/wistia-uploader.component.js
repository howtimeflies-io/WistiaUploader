function WistiaUploaderController(wistiaService) {
    var ctrl = this;
    ctrl.progress = NaN;
    ctrl.err = null;

    ctrl.onFileAdded = function (files) {
        var file = files[0];
        wistiaService.uploadFile(file, function (e) {
            ctrl.progress = Math.floor(e.loaded / e.total * 100);
        }).then(function (res) {
            console.log(res);
        }, function (err, status) {
            console.log(err);
            // 502 (Bad Gateway) {data: null, status: -1, headers: ƒ, config: {…}, statusText: "", …}
            ctrl.err = (err.data || {error: 'Unknown error with status: ' + err.status}).error;
        });
    }
}


angular.module('wistiaUploaderModule').component('wistiaUploader', {
    templateUrl: 'components/wistia-uploader/wistia-uploader.component.html',
    controller: ['wistiaService', WistiaUploaderController]
})
