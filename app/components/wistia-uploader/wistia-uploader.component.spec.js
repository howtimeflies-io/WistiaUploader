/* global module, inject */

describe('Wistia Uploader Component', function () {
    var ctrl, mockedWistiaService, mockedFileUpload, mockedUploadPromise, theWindow;

    beforeEach(module("wistiaUploaderModule"));

    beforeEach(inject(function (_$componentController_, $rootScope, $window) {
        theWindow = $window;

        mockedFileUpload = {
            fileupload: function () {
            },
            data: function () {
            }
        };
        spyOn(angular, 'element').and.returnValue(mockedFileUpload);

        mockedUploadPromise = {
            then: function () {
            }
        };
        mockedWistiaService = {
            uploadFile: function () {
                return mockedUploadPromise;
            }
        };

        ctrl = _$componentController_('wistiaUploader', {
            $scope: $rootScope.$new(),
            $window: $window,
            wistiaService: mockedWistiaService
        });
    }));

    it('should init the jQuery File Upload Plugin', function () {
        spyOn(mockedFileUpload, 'fileupload').and.callThrough();
        ctrl.$onInit();

        expect(mockedFileUpload.fileupload).toHaveBeenCalledTimes(1);
    });

    it('should alert when adding a non-video file', function () {
        spyOn(mockedFileUpload, 'fileupload').and.callThrough();
        ctrl.$onInit();

        expect(ctrl.err).toBeNull();

        var fnAdd = mockedFileUpload.fileupload.calls.mostRecent().args[0].add;
        fnAdd(null, {files: [{name: 'test.txt'}]});

        expect(ctrl.err).toEqual('Please pick a video file to upload.');
    });

    it('should upload a video file', function () {
        spyOn(mockedFileUpload, 'fileupload').and.callThrough();
        spyOn(mockedWistiaService, 'uploadFile').and.callThrough();
        ctrl.$onInit();

        var fnAdd = mockedFileUpload.fileupload.calls.mostRecent().args[0].add;
        fnAdd(null, {files: [{name: 'video.mp4'}]});

        expect(ctrl.err).toBeNull();
        expect(mockedWistiaService.uploadFile).toHaveBeenCalledTimes(1);
    });

    it('should update the upload progress', function () {
        spyOn(mockedFileUpload, 'fileupload').and.callThrough();
        spyOn(mockedWistiaService, 'uploadFile').and.callThrough();
        ctrl.$onInit();

        var fnAdd = mockedFileUpload.fileupload.calls.mostRecent().args[0].add;
        fnAdd(null, {files: [{name: 'video.mp4'}]});

        var fnUpdate = mockedWistiaService.uploadFile.calls.mostRecent().args[1];
        fnUpdate({loaded: 20, total: 100});

        expect(ctrl.progress).toEqual(20);
    });

    function uploadVideoSuccess() {
        spyOn(mockedFileUpload, 'fileupload').and.callThrough(); // eslint-disable-line jasmine/no-unsafe-spy
        spyOn(mockedUploadPromise, 'then').and.callThrough(); // eslint-disable-line jasmine/no-unsafe-spy
        ctrl.$onInit();

        var fnAdd = mockedFileUpload.fileupload.calls.mostRecent().args[0].add;
        fnAdd(null, {files: [{name: 'video.mp4'}]});

        var fnSuccess = mockedUploadPromise.then.calls.mostRecent().args[0];
        fnSuccess({data: {hashed_id: 'abc'}});
    }

    it('should set the video hashed id on upload success', function () {
        expect(ctrl.videoHashedId).toBeNull();
        uploadVideoSuccess();

        expect(ctrl.videoHashedId).toEqual('abc');
        expect(ctrl.progress).toBeNaN();
        expect(ctrl.err).toBeNull();
    });

    it('should keep the video player size on video ready', function () {
        theWindow._wq = [];
        uploadVideoSuccess();

        expect(theWindow._wq.length).toEqual(1);
        expect(theWindow._wq[0].id).toEqual('abc');

        var video = {
            h: NaN,
            height: function (h) {
                this.h = h;
            }
        };
        theWindow._wq[0].onReady(video);

        expect(video.h).toEqual(ctrl.height);
    });

    it('should alert the error message on upload failure', function () {
        spyOn(mockedFileUpload, 'fileupload').and.callThrough();
        spyOn(mockedUploadPromise, 'then').and.callThrough();
        ctrl.$onInit();

        var fnAdd = mockedFileUpload.fileupload.calls.mostRecent().args[0].add;
        fnAdd(null, {files: [{name: 'video.mp4'}]});

        var fnFailure = mockedUploadPromise.then.calls.mostRecent().args[1];

        fnFailure({data: {error: 'error'}});

        expect(ctrl.err).toEqual('Wistia: error');
        expect(ctrl.progress).toBeNaN();
        expect(ctrl.videoHashedId).toBeNull();
    });

    it('should close the alert', function () {
        ctrl.err = 'error';
        ctrl.closeAlert();

        expect(ctrl.err).toBeNull();
    });
});
