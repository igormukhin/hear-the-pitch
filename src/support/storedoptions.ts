import {reactive, toRefs, watch} from 'vue';

export function useStoredOptions<T extends Record<string, string | number | boolean>>(
    key: string,
    defaults: T,
    validators: {[K in keyof T]: (value: unknown) => value is T[K]}
) {
    const saved = {...defaults};
    const keys = Object.keys(defaults) as (keyof T)[];
    try {
        const stored: unknown = JSON.parse(localStorage.getItem(key) ?? 'null');
        if (stored && typeof stored === 'object') {
            for (const name of keys) {
                const value = (stored as Record<string, unknown>)[name as string];
                if (validators[name](value)) saved[name] = value;
            }
        }
    } catch {
        // Use defaults when storage is unavailable or malformed.
    }

    const options = reactive({...saved}) as T;
    watch(options, values => {
        for (const name of keys) {
            const value = values[name];
            if (validators[name](value)) saved[name] = value;
        }
        try {
            localStorage.setItem(key, JSON.stringify(saved));
        } catch {
            // Keep the options usable when storage is unavailable or full.
        }
    }, {flush: 'sync'});

    return toRefs(options);
}
