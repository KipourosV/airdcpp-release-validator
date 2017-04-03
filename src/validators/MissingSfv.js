import fs from 'async-file';
import path from 'path';


const simpleReleaseReg = /^[A-Z0-9]\S{3,}-[A-Za-z0-9_]{2,}$/; // case sensitive
const rarMp3Reg = /(.+\.((r\d{2})|(0\d{2})|(mp3)|(flac)))/i;
const mvidReg = /(.+\.(m2v|avi|mkv|mp(e)?g))/i;


const hasFiles = (files, reg) => {
	return files.some(file => file.match(reg));
};

const isSfvDirectory = directory => {
	if (hasFiles(directory.files, rarMp3Reg)) {
		return true;
	}

	if (directory.name.match(simpleReleaseReg) && hasFiles(directory.files, mvidReg)) {
		return true;
	}

	return false;
};
 
const validate = async (directory, reporter) => {
	// SFV files may also be inside subdirectory (directory name detection can't be used)
	if (!directory.sfvFiles.length && isSfvDirectory(directory)) {
		reporter.addFolder(directory.path, 'sfv_missing', 'SFV file possibly missing');
	}
};

const validateCondition = directory => !directory.sfvFiles.length;
 
export default {
	validateCondition,
	validate,
	setting: {
		key: 'missing_sfv',
		title: 'Check missing SFV files',
		default_value: true,
		type: 'boolean'
	},
}
