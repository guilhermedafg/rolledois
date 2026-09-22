import { derived, type Writable } from "svelte/store";

type WithSubscribe<T> = {
    [key: string]: unknown;
    subscribe: Writable<T>["subscribe"];
};

export function asyncDerivedStream<T, V>(
    store: WithSubscribe<T>,
    callback: (v: T) => Promise<V>,
    initialValue: V,
) {
    let previous = 0;

    return derived(
        store,
        ($stores, set) => {
            const start = Date.now();
            Promise.resolve(callback($stores)).then((value) => {
                if (start > previous) {
                    previous = start;
                    set(value);
                }
            });
        },
        initialValue,
    );
}
