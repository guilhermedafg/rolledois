export interface SignInRequestPayload {
    email: string;
    password: string;
}

export interface AuthResponsePayload {
    accessToken: string;
}

export interface GoogleAuthUrlResponsePayload {
    url: string;
}

export interface GoogleSignRequestPayload {
    code: string;
}

export interface RefreshTokenResponsePayload {
    accessToken: string;
}
