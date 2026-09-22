export type IpLocationResponse = IpLocationInfo | IpLocationError;

export interface IpLocationInfo {
    error?: false;
    ip: string;
    city: string;
    region: string;
    regionCode: string;
    countryCode: string;
    countryCodeIso3: string;
    countryName: string;
    countryCapital: string;
    countryTld: string;
    continentCode: string;
    inEu: boolean;
    postal: string;
    latitude: number;
    longitude: number;
    timezone: string;
    utcOffset: string;
    countryCallingCode: string;
    currency: string;
    currencyName: string;
    languages: string;
    asn: string;
    org: string;
}

export interface IpLocationError {
    error: true;
    ip: string;
    reason: string;
    reserved: boolean;
    version: string;
}
