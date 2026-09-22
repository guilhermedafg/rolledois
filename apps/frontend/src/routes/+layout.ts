import mixpanel from "mixpanel-browser";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = () => {
    mixpanel.init("1e825ce075b54dd011c0c1254f8fc92b", {
        autocapture: false,
        persistence: "localStorage",
        track_pageview: false,
    });

    return { mixpanel };
};
