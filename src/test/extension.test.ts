import * as assert from "assert";
import ImageConfig from "../Models/ImageConfig";
import { SettingsFile } from "../Models/Settings";

suite('ImageConfig', () => {
    test('GetImageName()', () => {
        let img = new ImageConfig('2018', '11', '');
        assert.equal(img.GetImageName(), 'microsoft/dynamics-nav:2018-cu11');
        img = new ImageConfig('2018', '11', 'us');
        assert.equal(img.GetImageName(), 'microsoft/dynamics-nav:2018-cu11-us');
        img = new ImageConfig('2018', undefined, 'us');
        assert.equal(img.GetImageName(), 'microsoft/dynamics-nav:2018-us');

        img = new ImageConfig('BC', '', '');
        assert.equal(img.GetImageName(), 'mcr.microsoft.com/businesscentral/sandbox');
        
        img = new ImageConfig('BC', '', 'dk');
        assert.equal(img.GetImageName(), 'mcr.microsoft.com/businesscentral/sandbox:dk');
    });
});

suite('SettingsFile', () => {
    test('DefaultSettings()', () => {
        let navSettings = SettingsFile.getSettings();
        navSettings.getVersion();
        navSettings.getCU();
        navSettings.getLocal();
    });
});