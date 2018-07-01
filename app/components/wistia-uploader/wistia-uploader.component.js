function WistiaUploaderController(wistiaService) {
    var ctrl = this;
    ctrl.progress = NaN;
    ctrl.err = null;
    ctrl.videoHashedId = null;

    ctrl.onFileAdded = function (files) {
        var file = files[0];
        wistiaService.uploadFile(file, function (e) {
            ctrl.progress = Math.floor(e.loaded / e.total * 100);
        }).then(function (res) {
            // {data: {hashed_id: "2uxmpksi7r"}}
            ctrl.videoHashedId = res.data.hashed_id;
            ctrl.progress = NaN;
            ctrl.err = null;
        }, function (err) {
            // {data: {error: "This account has exceeded its video limit..."}}
            ctrl.err = 'Wistia: ' + err.error;
            ctrl.progress = NaN;
        });
    }
}


angular.module('wistiaUploaderModule').component('wistiaUploader', {
    templateUrl: 'components/wistia-uploader/wistia-uploader.component.html',
    controller: ['wistiaService', WistiaUploaderController]
})
