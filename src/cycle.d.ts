declare module 'cycle' {
    interface Dictionary<T> {
        [key: string]: T;
    }

    export declare function decycle(obj: Dictionary): Record<string, unknown>;
}
