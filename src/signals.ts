let subscriber: (() => void) | null = null;
export const createSignal = <T = unknown>(initVal?: T) => {
	const subscribers = new Set<() => void>();
	let value = initVal as T;
	const getter = (): T => {
		if (subscriber !== null) {
			subscribers.add(subscriber);
		}
		return value;
	};
	const setter = (newValue: T) => {
		value = newValue;
		for (const fn of subscribers) {
			fn();
		}
	};
	return [getter, setter];
};

export const derived = (fn: () => void) => {
	const [getter, setter] = createSignal();
	createEffect(() => {
		setter(fn());
	});
	return getter;
};

export const createEffect = (fn: () => void) => {
	subscriber = fn;
	fn();
	subscriber = null;
};
