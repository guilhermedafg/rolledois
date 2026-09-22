/* eslint-disable @typescript-eslint/naming-convention */
export type RolleErrorCode =
    | "Rolle.Request.MissingParam"
    | "Rolle.Input.Validation"
    | "Rolle.Auth.Validation"
    | "Rolle.Auth.Unauthenticated"
    | "Rolle.Auth.Forbidden"
    | "Rolle.Auth.WrongMethod"
    | "Rolle.Resource.NotFound"
    | "Rolle.Provider.AlreadyLinked"
    | "Rolle.Server.Internal";

export const ERROR_CODE_TO_STATUS: Record<RolleErrorCode, number> = {
    "Rolle.Request.MissingParam": 400,
    "Rolle.Input.Validation": 400,
    "Rolle.Auth.Validation": 400,
    "Rolle.Auth.WrongMethod": 400,
    "Rolle.Provider.AlreadyLinked": 400,
    "Rolle.Auth.Unauthenticated": 401,
    "Rolle.Auth.Forbidden": 403,
    "Rolle.Resource.NotFound": 404,
    "Rolle.Server.Internal": 500,
} as const;

interface ErrorObject {
    [key: string]: string | ErrorObject;
}

type EndsWith<Key extends string, Suffix extends string> = Key extends `${string}${Suffix}`
    ? Key
    : never;

type NotEndsWith<Key extends string, Suffix extends string> = Key extends `${string}${Suffix}`
    ? never
    : Key;

type MetaByCode = {
    [K in EndsWith<RolleErrorCode, ".Validation">]: {
        fields: ErrorObject;
        [key: string]: unknown;
    };
} & {
    [K in NotEndsWith<RolleErrorCode, ".Validation">]?: Record<string, unknown>;
};

export class RolleError<C extends RolleErrorCode = RolleErrorCode> extends Error {
    static isInputValidationError(value: unknown): value is RolleError<"Rolle.Input.Validation"> {
        return value instanceof RolleError && value.code.endsWith("Validation");
    }

    readonly code: C;
    readonly status: number;
    readonly meta?: MetaByCode[C];
    override cause?: unknown;

    constructor(opts: {
        code: C;
        message: string;
        meta?: MetaByCode[C];
        status?: number;
        cause?: unknown;
    }) {
        super(opts.message);
        this.name = "RolleError";
        this.code = opts.code;
        this.status = opts.status ?? ERROR_CODE_TO_STATUS[opts.code] ?? 500;
        this.meta = opts.meta;
        this.cause = opts.cause;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace?.(this, RolleError);
    }

    getResponse(): Response {
        return new Response(
            JSON.stringify({
                code: this.code,
                message: this.message,
                status: this.status,
                meta: this.meta,
            }),
            {
                status: this.status,
                headers: { "content-type": "application/json" },
            },
        );
    }
}

export const isRolleError = (e: unknown): e is RolleError =>
    typeof e === "object" && !!e && (e as any).name === "RolleError";
