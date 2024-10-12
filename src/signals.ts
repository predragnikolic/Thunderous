
export type SignalGetter<T> = () => T;
export type SignalSetter<T> = (newValue: T) => void;
export type Signal<T = unknown> = [SignalGetter<T>, SignalSetter<T>];

let subscriber: (() => void) | null = null;
export const createSignal = <T = undefined>(initVal?: T): Signal<T> => {
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

export const derived = <T>(fn: () => T): SignalGetter<T> => {
	const [getter, setter] = createSignal<T>();
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
