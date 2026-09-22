// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
    namespace App {
        // interface Error {}
        // interface Locals {}
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
    }

    interface Window {
        dataLayer: IArguments[];
        cookieStore: {
            get(key: string): Promise<CookieListItem | null>;
            set(key: string, value: string);
        };

        /* eslint-disable @typescript-eslint/no-explicit-any */
        gtag?: (...args: any[]) => void;
    }
}

export {};
