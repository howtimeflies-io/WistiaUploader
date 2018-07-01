describe('Wistia Uploader Component', function () {
    var ctrl, mockedWistiaService, mockedFileUpload, mockedUploadPromise;

    beforeEach(module("wistiaUploaderModule"));

    beforeEach(inject(function (_$componentController_, $rootScope) {
        mockedFileUpload = {
            fileupload: function () {
            },
            data: function () {
            }
        }
        spyOn(angular, 'element').and.returnValue(mockedFileUpload);

        mockedUploadPromise = {
            then: function () {
            }
        }
        mockedWistiaService = {
            uploadFile: function () {
                return mockedUploadPromise;
            }
        }

        ctrl = _$componentController_('wistiaUploader', {
            $scope: $rootScope.$new(),
            wistiaService: mockedWistiaService
        })
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

    it('should set the video hashed id on upload success', function () {
        spyOn(mockedFileUpload, 'fileupload').and.callThrough();
        spyOn(mockedUploadPromise, 'then').and.callThrough();
        ctrl.$onInit();

        var fnAdd = mockedFileUpload.fileupload.calls.mostRecent().args[0].add;
        fnAdd(null, {files: [{name: 'video.mp4'}]});

        var fnSuccess = mockedUploadPromise.then.calls.mostRecent().args[0];

        expect(ctrl.videoHashedId).toBeNull();
        fnSuccess({data: {hashed_id: 'abc'}});

        expect(ctrl.videoHashedId).toEqual('abc');
        expect(ctrl.progress).toBeNaN();
        expect(ctrl.err).toBeNull();
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
