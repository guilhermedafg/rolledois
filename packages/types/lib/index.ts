import { GeometryPoint, RecordId } from "surrealdb";
import {
    TABLE_ADDRESS,
    TABLE_ATTRACTION,
    TABLE_CITY,
    TABLE_COUNTRY,
    TABLE_EVENT,
    TABLE_EVENT_CATEGORY,
    TABLE_LIST,
    TABLE_MIGRATION,
    TABLE_RESET_PASSWORD,
    TABLE_STATE,
    TABLE_TAG,
    TABLE_USER,
    TABLE_VENUE,
    TABLE_VENUE_CATEGORY,
} from "@rolle/core";
export * from "./instagram";

/**
 * CORE
 */

interface Identifiable<T extends string> {
    id: RecordId<T>;
}

interface Timestamp {
    createdAt: string;
    updatedAt: string;
}

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type Migration = Identifiable<typeof TABLE_MIGRATION>;

export type Providers = "google";

export interface PaginationArgs {
    page: number;
    limit: number;
}

export interface Paginated<T, M extends Record<string, any> = object> {
    meta: {
        page: number;
        limit: number;
        total: number;
    } & M;
    data: Array<T>;
}

/**
 * Address
 */

export interface Country extends Identifiable<typeof TABLE_COUNTRY> {
    fullName: string;
    shortName: string;
}

export interface State extends Identifiable<typeof TABLE_STATE> {
    fullName: string;
    shortName: string;
    country?: Country;
}

export interface CreateState {
    id?: RecordId<typeof TABLE_STATE>;
    fullName: string;
    shortName: string;
    country?: RecordId<typeof TABLE_COUNTRY>;
}

export interface City extends Identifiable<typeof TABLE_CITY> {
    fullName: string;
    imageUrl?: string;
    state?: State;
    country?: Country;
}

export interface CreateCity {
    fullName: string;
    imageUrl?: string;
    state?: RecordId<typeof TABLE_STATE>;
    country?: RecordId<typeof TABLE_COUNTRY>;
}

export interface Address extends Identifiable<typeof TABLE_ADDRESS>, Timestamp {
    full: string;
    zipcode: string;
    street: string;
    number: string;
    district: string;
    city: City;
    state: State;
    country: Country;
}

export interface CreateAddress {
    zipcode: string;
    street: string;
    number: string;
    district: string;
    city: RecordId<typeof TABLE_CITY>;
    state: RecordId<typeof TABLE_STATE>;
    country: RecordId<typeof TABLE_COUNTRY>;
}

export interface CreateAddressPayload extends Omit<CreateAddress, "city" | "state" | "country"> {
    city: string;
    state: string;
    country: string;
}

/**
 * User
 */

export interface User extends Identifiable<typeof TABLE_USER>, Timestamp {
    nickname: string;
    email: string;
    password?: string;
    name: {
        first: string;
        last: string;
        full: string;
    };
    verified: boolean;
    pictureUrl: string;
    bio: {
        long: string;
        short: string;
    };
    phone?: string;
    birthdate?: Date;
    providers?: {
        googleId?: string;
        instagramId?: string;
    };
    bookmarks?: {
        venues: Array<{
            id: Venue["id"];
            googlePlaceId?: Venue["googlePlaceId"];
            createdAt: string;
        }>;
        lists: Array<{
            id: List["id"];
            name: List["name"];
            cover: List["cover"];
            uri: List["uri"];
            owner: Pick<List["owner"], "id" | "name" | "pictureUrl">;
        }>;
    };
    alreadyBeen?: Array<{
        id: Venue["id"];
        googlePlaceId?: Venue["googlePlaceId"];
        createdAt: string;
    }>;
    following?: Array<{
        id: User["id"];
        name: User["name"];
        nickname: User["nickname"];
        pictureUrl: User["pictureUrl"];
    }>;
    followers?: Array<{
        id: User["id"];
        name: User["name"];
        nickname: User["nickname"];
        pictureUrl: User["pictureUrl"];
    }>;
    meta: {
        isInstagramLinked?: boolean;
        totalLists: number;
        totalVenuesBookmarked: number;
        venuesBookmarkedCategories?: Array<Venue["category"]>;
        venuesBookmarkedCities: Array<{
            city: Address["city"]["fullName"];
            count: number;
        }>;
    };
}

export type UserFull = WithRequired<User, "bookmarks" | "following" | "followers" | "alreadyBeen">;

export interface CreateUser {
    nickname: string;
    email: string;
    password?: string;
    pictureUrl: string;
    verified?: boolean;
    name: {
        first: string;
        last: string;
    };
    phone?: string;
    birthdate?: Date;
    bio?: {
        long?: string;
        short?: string;
    };
    providers?: {
        googleId?: string;
    };
}

export interface CreateUserPayload {
    nickname: string;
    email: string;
    password: string;
    pictureBase64?: string;
    name: {
        first: string;
        last: string;
    };
    phone?: string;
    birthdate?: Date;
    bio?: {
        long?: string;
        short?: string;
    };
}

export interface UpdateUser {
    nickname?: string;
    pictureUrl?: string;
    password?: string;
    name?: {
        first?: string;
        last?: string;
    };
    phone?: string;
    birthdate?: Date;
    providers?: {
        instagramId?: string;
    };
    bio?: {
        long?: string;
        short?: string;
    };
}

export interface UpdateUserPayload {
    nickname?: string;
    pictureBase64?: string;
    name?: {
        first?: string;
        last?: string;
    };
    phone?: string;
    birthdate?: Date;
    bio?: {
        long?: string;
        short?: string;
    };
}

export interface ResetPassword extends Identifiable<typeof TABLE_RESET_PASSWORD> {
    user: User["id"];
    resetToken: string;
}

/**
 * Tag
 */

export type Tag = Identifiable<typeof TABLE_TAG>;

/**
 * Venue
 */

export type VenueCategory = Identifiable<typeof TABLE_VENUE_CATEGORY>;

export interface Venue extends Identifiable<typeof TABLE_VENUE>, Timestamp {
    uri: string;
    name: string;
    description?: string;
    category: VenueCategory["id"];
    googlePlaceId?: string;
    address?: Address;
    geo?: GeometryPoint;
    hints: Array<string>;
    workingHours?: {
        monday?: Array<{ start: string; end: string }>;
        tuesday?: Array<{ start: string; end: string }>;
        wednesday?: Array<{ start: string; end: string }>;
        thursday?: Array<{ start: string; end: string }>;
        friday?: Array<{ start: string; end: string }>;
        saturday?: Array<{ start: string; end: string }>;
        sunday?: Array<{ start: string; end: string }>;
    };
    phone?: string;
    website?: string;
    socials: {
        instagram?: string;
        tiktok?: string;
        x?: string;
    };
    cover: {
        thumbUrl: string;
        url: string;
    };
    images: Array<{
        thumbUrl: string;
        url: string;
    }>;
    meta?: {
        distance?: number;
    };
}

export interface CreateVenue {
    uri: string;
    name: string;
    description?: string;
    googlePlaceId?: string;
    category: RecordId<typeof TABLE_VENUE_CATEGORY>;
    address?: RecordId<typeof TABLE_ADDRESS>;
    geo?: GeometryPoint;
    hints?: Array<string>;
    workingHours?: {
        monday?: Array<{ start: string; end: string }>;
        tuesday?: Array<{ start: string; end: string }>;
        wednesday?: Array<{ start: string; end: string }>;
        thursday?: Array<{ start: string; end: string }>;
        friday?: Array<{ start: string; end: string }>;
        saturday?: Array<{ start: string; end: string }>;
        sunday?: Array<{ start: string; end: string }>;
    };
    phone?: string;
    website?: string;
    socials: {
        instagram?: string;
        tiktok?: string;
        x?: string;
    };
    cover: {
        thumbUrl: string;
        url: string;
    };
    images: Array<{
        thumbUrl: string;
        url: string;
    }>;
}

export interface CreateVenuePayload extends Omit<CreateVenue, "address" | "category"> {
    category: string;
    address: CreateAddressPayload;
}

/**
 * Event
 */

export type Attraction = Identifiable<typeof TABLE_ATTRACTION>;

export type EventCategory = Identifiable<typeof TABLE_EVENT_CATEGORY>;

export interface Event extends Identifiable<typeof TABLE_EVENT>, Timestamp {
    name: string;
    description: string;
    category: EventCategory["id"];
    address: Address;
    venue?: Venue;
    cover: {
        thumbUrl: string;
        url: string;
    };
    images: Array<{
        thumbUrl: string;
        url: string;
    }>;
}

/**
 * List
 */

export interface List extends Identifiable<typeof TABLE_LIST>, Timestamp {
    name: string;
    description?: string;
    uri: string;
    owner: User;
    private: boolean;
    cover?: {
        thumbUrl: string;
        url: string;
    };
    venues?: Array<{ record: Venue; comment?: string; distance?: number }>;
    events?: Array<Event>;
    meta: {
        bookmarksCount?: number;
        totalVenues: number;
        venuesCities: Array<string>;
    };
}

export type ListFull = WithRequired<List, "venues" | "events">;

export interface CreateList {
    name: string;
    description?: string;
    owner: User["id"];
    private?: boolean;
    cover: {
        thumbUrl: string;
        url: string;
    };
    venues: Array<{
        record: Venue["id"];
        comment?: string;
    }>;
    events: Array<Event["id"]>;
}

export interface CreateListPayload {
    name: string;
    description?: string;
    private?: boolean;
    imageBase64?: string;
    venues: Array<string>;
    events: Array<string>;
}

export interface UpdateList {
    name?: string;
    description?: string;
    private?: boolean;
    cover?: {
        thumbUrl: string;
        url: string;
    };
}

export interface UpdateListPayload {
    name?: string;
    description?: string;
    imageBase64?: string;
    private?: boolean;
}

export interface AddVenueToList {
    listId: List["id"];
    venueId: Venue["id"];
}

export interface AddVenueToListPayload {
    placeId: string;
}

export interface RemoveVenueFromList {
    listId: List["id"];
    venueId: Venue["id"];
}

export interface RemoveVenueFromListPayload {
    placeId: string;
}

export interface AddCommentToListPayload {
    venueId: Venue["id"];
    comment: string;
}
