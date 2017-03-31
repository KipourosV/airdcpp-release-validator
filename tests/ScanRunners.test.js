import ScanRunners from 'ScanRunners';
import path from 'path';

import validators from 'validators';

describe('Scan runner', () => {
	test('should reject failed bundles', async () => {
		const scanPath = path.join(__dirname, 'data/Test.Release-TEST');

		const bundle = {
			name: 'Test.Release-TEST',
			path: scanPath,
			type: {
				id: 'directory',
			},
		};

		const socket = {
			post: _ => {},
		};

		const reject = jest.fn();
		const accept = jest.fn();

		const runner = ScanRunners(socket, 'test-extension', _ => validators);
		await runner.onBundleFinished(bundle, accept, reject);

		expect(reject.mock.calls.length).toBe(1);
		expect(accept.mock.calls.length).toBe(0);
	});

	test('should perform share scan', async () => {
		const sharePaths = [
			{
				name: 'VNAME',
				paths: [ path.join(__dirname, 'data/Test.Release-TEST') ],
			}
		];

		const socket = {
			post: _ => {},
			get: _ => Promise.resolve(sharePaths),
		};

		const runner = ScanRunners(socket, 'test-extension', _ => validators);
		const scanner = await runner.scanShare();

		expect(scanner.errors.count() > 0).toBe(true);
	});
});