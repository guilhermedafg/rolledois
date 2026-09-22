export function setPausableInterval(cb: () => void, ms: number) {
    let interval: NodeJS.Timeout | undefined;

    function start() {
        if (typeof interval === "undefined") {
            interval = setInterval(cb, ms);
        }
    }

    function stop() {
        clearInterval(interval);
        interval = undefined;
    }

    return { start, stop };
}
