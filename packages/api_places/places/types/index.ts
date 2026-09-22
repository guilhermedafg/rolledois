// Days of week in Portuguese, as they appear in the data
export type Weekday =
    | "segunda-feira"
    | "terça-feira"
    | "quarta-feira"
    | "quinta-feira"
    | "sexta-feira"
    | "sábado"
    | "domingo";

// Represents the map of service/detail categories to boolean flags
type DetailCategory = Record<string, boolean>;

// The "about" → "details" structure: map from category name to flags
type AboutDetails = Record<string, DetailCategory>;

// "about" section
interface About {
    summary: string | null;
    details: AboutDetails;
}

// A single photo or street-view sample
interface PhotoSample {
    photoId: string;
    photoUrl: string;
    photoUrlLarge: string | null;
    videoThumbnailUrl: string | null;
    latitude: number;
    longitude: number;
    type: string;
    photoDatetimeUtc: string; // ISO 8601
    photoTimestamp: number; // Unix epoch seconds
}

// Business info
export interface BusinessInfo {
    businessId: string;
    googleId: string;
    placeId: string;
    googleMid: string;
    phoneNumber: string;
    name: string;
    latitude: number;
    longitude: number;
    fullAddress: string;
    reviewCount: number;
    rating: number | null;
    timezone: string;
    openingStatus: string;
    workingHours: Record<Weekday, string[]>;
    website: string | null;
    tld?: string; // present only on some entries
    verified: boolean;
    placeLink: string;
    cid: string;
    reviewsLink: string | null;
    ownerId: string;
    ownerLink: string;
    ownerName: string;
    bookingLink: string | null;
    reservationsLink: string | null;
    businessStatus: string;
    type: string;
    subtypes: string[];
    subtypeGcids: string[];
    photosSample: PhotoSample[];
    reviewsPerRating: Record<string, number>; // keys "1" through "5"
    photoCount: number;
    about: About;
    address: string;
    orderLink: string | null;
    priceLevel: string | null;
    district: string;
    streetAddress: string;
    city: string;
    zipcode: string;
    state: string;
    country: string;
}

export interface KeywordMention {
    keyword: string;
    reviewCount: number;
}

export interface BusinessDetailedInfo {
    businessId: string;
    googleId: string;
    placeId: string;
    googleMid: string;
    phoneNumber: string | null;
    name: string;
    latitude: number;
    longitude: number;
    fullAddress: string;
    reviewCount: number;
    rating: number;
    timezone: string;
    openingStatus: string;
    workingHours?: Record<Weekday, string[]>;
    website: string | null;
    verified: boolean;
    placeLink: string;
    cid: string;
    reviewsLink: string;
    ownerId: string;
    ownerLink: string;
    ownerName: string;
    bookingLink: string | null;
    reservationsLink: string | null;
    businessStatus: string;
    type: string;
    subtypes: string[];
    subtypeGcids: string[];
    photosSample: PhotoSample[];
    globalPlusCode: string;
    compoundPlusCode: string;
    reviewsPerRating: Record<string, number>; // keys "1" through "5"
    photoCount: number;
    about: About;
    address: string;
    menuLink: string | null;
    orderLink: string | null;
    priceLevel: string;
    district?: string;
    streetAddress: string;
    city: string;
    zipcode?: string;
    state: string;
    country: string;
    postsSample: any[] | null; // if later posts have a defined shape, replace any
    postsLink: string | null;
    keywordsMentionedInReviews: KeywordMention[];
    emailsAndContacts: Record<string, any> | null; // likewise, refine when shape is known
}

export interface BusinessReview {
    reviewId: string;
    reviewText: string;
    rating: number;
    reviewTimestamp: number;
    reviewLink: string;
    reviewPhotos: string[];
    reviewLanguage: string;
    likeCount: number;
    authorId: string;
    authorLink: string;
    authorName: string;
    authorPhotoUrl: string;
    authorReviewCount: number;
    authorReviewsLink: string;
    authorLocalGuideLevel: number;
    hotelRatingBreakdown: Record<string, number>;
    reviewSource: string;
}
