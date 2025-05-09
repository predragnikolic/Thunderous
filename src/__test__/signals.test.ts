import { effect, signal, derived } from '../signals';
import { test } from 'node:test';
import assert from 'assert';
import { assumeObj } from '../utilities';
import { getErrorMock, getLogMock, nextMicrotask } from './_test-utils';

await test('createSignal', async () => {
	await test('initial value', () => {
		const [count] = signal(0);
		assert.strictEqual(count(), 0);
	});
	await test('set value', () => {
		const count = signal(0);
		count.set(1);
		assert.strictEqual(count(), 1);
	});
	await test('batch updates', async () => {
		const count = signal(0);
		let result: number | undefined;
		let runCount = 0;
		effect(() => {
			result = count();
			runCount++;
		});
		count.set(1);
		count.set(2);
		count.set(3);
		count.set(4);

		// Wait for the effect to run
		await nextMicrotask();

		assert.strictEqual(result, 4);
		assert.strictEqual(runCount, 2);
	});
	await test('does not recalculate for equal primitives', async () => {
		const count = signal(0);
		let runCount = 0;
		effect(() => {
			count();
			runCount++;
		});
		count.set(0);

		// Wait for the effect to run
		await nextMicrotask();

		assert.strictEqual(runCount, 1);
	});
	await test('recalculates for complex data', async () => {
		const count = signal({ value: 0 });
		let runCount = 0;
		effect(() => {
			count();
			runCount++;
		});
		count.set({ value: 0 });

		// Wait for the effect to run
		await nextMicrotask();

		assert.strictEqual(runCount, 2);
	});
	await test('debug mode', async (t) => {
		await test('Adds the label when the signal is created with one', async () => {
			const logMock = getLogMock(t);

			const count = signal(0, { debugMode: true, label: 'count' });

			await test('does not log when the signal is initially created', () => {
				assert.strictEqual(logMock.callCount(), 0);
			});

			await test('logs when the signal getter is run', async () => {
				count();

				// Wait for the debug log to run
				await nextMicrotask();
				assert.strictEqual(logMock.callCount(), 1);
				assert.deepStrictEqual(logMock.calls[0].arguments, [
					'Signal retrieved:',
					{ value: 0, subscribers: new Set(), label: '(count)' },
				]);
			});

			await test('logs when the signal setter is run', async () => {
				count.set(1);

				// Wait for the debug log to run
				await nextMicrotask();
				assert.strictEqual(logMock.callCount(), 2);
				assert.deepStrictEqual(logMock.calls[1].arguments, [
					'Signal set:',
					{ oldValue: 0, newValue: 1, subscribers: new Set(), label: '(count)' },
				]);
			});
		});

		await test('Uses "anonymous signal" when the signal is created without a label', async () => {
			const logMock = getLogMock(t);
			const count = signal(0, { debugMode: true });

			await test('does not log when the signal is initially created', () => {
				assert.strictEqual(logMock.callCount(), 0);
			});

			await test('logs when the signal getter is run', async () => {
				count();

				// Wait for the debug log to run
				await nextMicrotask();
				assert.strictEqual(logMock.callCount(), 1);
				assert.deepStrictEqual(logMock.calls[0].arguments, [
					'Signal retrieved:',
					{ value: 0, subscribers: new Set(), label: 'anonymous signal' },
				]);
			});

			await test('logs when the signal setter is run', async () => {
				count.set(1);

				// Wait for the debug log to run
				await nextMicrotask();
				assert.strictEqual(logMock.callCount(), 2);
				assert.deepStrictEqual(logMock.calls[1].arguments, [
					'Signal set:',
					{ oldValue: 0, newValue: 1, subscribers: new Set(), label: 'anonymous signal' },
				]);
			});
		});

		await test('Does not log if debugMode is false', async () => {
			const logMock = getLogMock(t);
			const count = signal(0, { debugMode: false, label: 'count' });

			await test('does not log when the signal is initially created', () => {
				assert.strictEqual(logMock.callCount(), 0);
			});

			await test('does not log when the signal getter is run', async () => {
				count();

				// Wait for the debug log to run
				await nextMicrotask();
				assert.strictEqual(logMock.callCount(), 0);
			});

			await test('does not log when the signal setter is run', async () => {
				count.set(1);

				// Wait for the debug log to run
				await nextMicrotask();
				assert.strictEqual(logMock.callCount(), 0);
			});
		});

		await test('Adds getter and setter labels in addition to the overall signal label', async () => {
			const logMock = getLogMock(t);
			const count = signal(0, { debugMode: true, label: 'count' });

			await test('does not log when the signal is initially created', () => {
				assert.strictEqual(logMock.callCount(), 0);
			});

			await test('logs when the signal getter is run with a label', async () => {
				count({ debugMode: true, label: 'getter' });

				// Wait for the debug log to run
				await nextMicrotask();
				assert.strictEqual(logMock.callCount(), 1);
				assert.deepStrictEqual(logMock.calls[0].arguments, [
					'Signal retrieved:',
					{ value: 0, subscribers: new Set(), label: '(count) getter' },
				]);
			});

			await test('logs when the signal setter is run with a label', async () => {
				count.set(1, { debugMode: true, label: 'setter' });

				// Wait for the debug log to run
				await nextMicrotask();
				assert.strictEqual(logMock.callCount(), 2);
				assert.deepStrictEqual(logMock.calls[1].arguments, [
					'Signal set:',
					{ oldValue: 0, newValue: 1, subscribers: new Set(), label: '(count) setter' },
				]);
			});
		});

		await test('Adds getter and setter labels instead of the overall signal label', async () => {
			const logMock = getLogMock(t);
			const count = signal(0);

			await test('does not log when the signal is initially created', () => {
				assert.strictEqual(logMock.callCount(), 0);
			});

			await test('logs when the signal getter is run with a label', async () => {
				count({ debugMode: true, label: 'getter' });

				// Wait for the debug log to run
				await nextMicrotask();
				assert.strictEqual(logMock.callCount(), 1);
				assert.deepStrictEqual(logMock.calls[0].arguments, [
					'Signal retrieved:',
					{ value: 0, subscribers: new Set(), label: 'getter' },
				]);
			});

			await test('logs when the signal setter is run with a label', async () => {
				count.set(1, { debugMode: true, label: 'setter' });

				// Wait for the debug log to run
				await nextMicrotask();
				assert.strictEqual(logMock.callCount(), 2);
				assert.deepStrictEqual(logMock.calls[1].arguments, [
					'Signal set:',
					{ oldValue: 0, newValue: 1, subscribers: new Set(), label: 'setter' },
				]);
			});
		});

		await test('handles errors in subscribers', async (t) => {
			const errorMock = getErrorMock(t);
			const count = signal(0);
			const error = new Error('Test error');
			effect(() => {
				if (count() === 1) {
					throw error;
				}
			});
			count.set(1);

			// Wait for the effect to run
			await nextMicrotask();
			assert.strictEqual(errorMock.callCount(), 1);
			assert.deepStrictEqual(errorMock.calls[0].arguments, [
				'Error in subscriber:',
				{ error, oldValue: 0, newValue: 1, fn: assumeObj(errorMock.calls[0].arguments[1]).fn },
			]);
		});
	});
});

await test('effect', async () => {
	await test('runs immediately', () => {
		const [count] = signal(0);
		let result: number | undefined;
		effect(() => {
			result = count();
		});
		assert.strictEqual(result, 0);
	});
	await test('runs when signals change', async () => {
		const count = signal(0);
		let result: number | undefined;
		effect(() => {
			result = count();
		});
		count.set(1);

		// Wait for the effect to run
		await nextMicrotask();

		assert.strictEqual(result, 1);
	});
	await test('multiple subscribers', async () => {
		const count = signal(0);
		let result1: number | undefined;
		let result2: number | undefined;
		effect(() => {
			result1 = count();
		});
		effect(() => {
			result2 = count();
		});
		count.set(1);

		// Wait for the effect to run
		await nextMicrotask();

		assert.strictEqual(result1, 1);
		assert.strictEqual(result2, 1);
	});
	await test('handles errors in effects', async (t) => {
		const errorMock = getErrorMock(t);
		const error = new Error('Test error');
		effect(() => {
			throw error;
		});

		// Wait for the effect to run
		await nextMicrotask();
		assert.strictEqual(errorMock.callCount(), 1);
		assert.deepStrictEqual(errorMock.calls[0].arguments, [
			'Error in effect:',
			{ error, fn: assumeObj(errorMock.calls[0].arguments[1]).fn },
		]);
	});
});

await test('derived', async () => {
	await test('calculates the value immediately', () => {
		const [count] = signal(1);
		const doubled = derived(() => count() * 2);
		assert.strictEqual(doubled(), 2);
	});
	await test('recalculates the value upon updating', async () => {
		const count = signal(1);
		const doubled = derived(() => count() * 2);
		count.set(2);

		// Wait for the effect to run
		await nextMicrotask();

		assert.strictEqual(doubled(), 4);
	});
	await test('handles errors in derived signals', async (t) => {
		const errorMock = getErrorMock(t);
		const error = new Error('Test error');
		const count = signal(1);
		derived(() => {
			if (count() === 2) {
				throw error;
			}
		});
		count.set(2);

		// Wait for the effect to run
		await nextMicrotask();
		assert.strictEqual(errorMock.callCount(), 1);
		assert.deepStrictEqual(errorMock.calls[0].arguments, [
			'Error in derived signal:',
			{ error, fn: assumeObj(errorMock.calls[0].arguments[1]).fn },
		]);
	});
});
