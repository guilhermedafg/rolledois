import type { User } from "@rolle/types";

declare global {
    type Variables = {
        user?: User;
    };

    interface HonoRolle {
        Bindings: object;
        Variables: Variables;
    }
}
