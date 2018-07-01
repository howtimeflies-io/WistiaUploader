describe('Wistia Service', function () {
    var wistiaService, httpBackend, http;

    beforeEach(module("wistiaUploaderModule"));

    beforeEach(inject(function (_wistiaService_, $httpBackend, $http) {
        wistiaService = _wistiaService_;
        httpBackend = $httpBackend;
        http = $http;
    }));

    it('should invoke $http.post in uploading a file', function () {
        httpBackend
            .when('POST', 'https://upload.wistia.com')
            .respond({
                hashed_id: 'abcdefg'
            });

        wistiaService.uploadFile({}).then(function (res) {
            expect(res.data.hashed_id).toEqual('abcdefg');
        }, function () {
            fail('it should not fail.');
        });

        httpBackend.flush();
    });

    it('should invoke progress callback function', function () {
        spyOn(http, 'post').and.returnValue({});

        var progress = 0;
        wistiaService.uploadFile({}, function (e) {
            progress = e.loaded / e.total * 100;
        });

        var fnCallback = http.post.calls.mostRecent().args[2].uploadEventHandlers.progress;
        fnCallback({
            lengthComputable: true,
            loaded: 20,
            total: 100
        });

        expect(progress).toEqual(20);
    });
});
