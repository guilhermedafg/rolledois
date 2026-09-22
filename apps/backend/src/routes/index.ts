import authRouter from "./auth";
import profileRouter from "./profile";
import venueRouter from "./venue";
import placeRouter from "./place";
import listRouter from "./list";
import userRouter from "./user";
import searchRouter from "./search";
import metaRouter from "./meta";

export const routes = {
    ["/auth"]: authRouter,
    ["/profile"]: profileRouter,
    ["/venue"]: venueRouter,
    ["/place"]: placeRouter,
    ["/list"]: listRouter,
    ["/user"]: userRouter,
    ["/search"]: searchRouter,
    ["/meta"]: metaRouter,
};
