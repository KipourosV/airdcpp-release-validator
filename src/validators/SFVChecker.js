import path from 'path';
import SFVReader from '../SFVReader';
 
 
const audioBookExtrasReg = /.+\.(jp(e)?g|png|m3u|cue|zip|sfv|nfo)/i;
const flacExtrasReg = /.+\.(jp(e)?g|png|m3u|cue|log|sfv|nfo)/i;
const normalExtrasReg = /.+\.(jp(e)?g|png|m3u|cue|diz|sfv|nfo)/i;
 
const audioBookReg = /.+(-|\()AUDIOBOOK(-|\)).+/i;
const flacReg = /.+(-|\()(LOSSLESS|FLAC)((-|\)).+)?/i;
 
 
// Get regex for allowed extra files (type is detected from the directory name)
const getExtrasReg = (name) => {
    if (name.match(audioBookReg)) {
        return audioBookExtrasReg;
    } else if (name.match(flacReg)) {
        return flacExtrasReg;
    }
 
    return normalExtrasReg;
};
 
const validateCondition = directory => directory.files.length && directory.sfvFiles.length;
 
const validate = async (directory, reporter) => {
    const files = new Set(directory.files);
 
    // Load SFV files
    const reader = SFVReader(directory.path);
 
    let loadedSfvFiles = 0;
    await Promise.all(directory.sfvFiles.map(async (file) => {
        try {
            await reader.load(file);
            loadedSfvFiles++;
        } catch (e) {
            reporter.addFile( file, 'invalid_sfv_file', e);
        }
    }));
 
    if (!loadedSfvFiles) {
        return;
    }
 
    // Iterate through the SFV file and compare with the content
    // Matching files are removed so that we can detect extras
    Object.keys(reader.content).forEach(file => {
        if (!files.has(file)) {
            reporter.addFile(file, 'file_missing', 'File listed in the SFV file does not exist on disk');
        } else {
            files.delete(file);
        }
    });
 
    // Extra files
    if (files.size > 0) {
        const extrasReg = getExtrasReg(directory.name);
        files.forEach(file => {
            if (!file.match(extrasReg)) {
                reporter.addFile(file, 'extra_files', 'Extra files in release directory');
            }
        });
    }
};
 
export default {
    validateCondition,
    validate,
    setting: {
        key: 'scan_sfv_file',
        title: 'Check content based on SFV files',
        default_value: true,
        type: 'boolean'
    },
}