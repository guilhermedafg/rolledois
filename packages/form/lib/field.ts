import { get, type Writable, writable } from "svelte/store";
import { debounce } from "throttle-debounce";
import type { ValidatorFn } from "./validators";

export type FieldValue = string | number | boolean | string[] | number[];

/**
 * Field config.
 */
export interface FieldConfig {
    /**
     * Defaults to `false`.
     */
    validateOnInit?: boolean;
}

export class Field<Value = FieldValue> {
    /**
     * Holds field configuration.
     */
    private _config: FieldConfig;

    /**
     * Holds the initial value given to this field.
     */
    private _initialValue: Value;

    /**
     * Holds field value.
     */
    value: Writable<Value>;

    /**
     * Holds all field validators.
     */
    validators: Array<ValidatorFn<Value>>;

    /**
     * Holds current error message.
     */
    errorMessage: Writable<string | undefined>;

    /**
     * Holds field touch state.
     */
    touched: Writable<boolean>;

    /**
     * Holds field focus state.
     */
    focus: Writable<boolean>;

    /**
     * Holds field validity.
     */
    valid: Writable<boolean>;

    constructor(
        initialValue: Value,
        validators: Array<ValidatorFn<Value>> = [],
        config: Partial<FieldConfig> = {},
    ) {
        this._initialValue = initialValue;
        this.value = writable(initialValue);
        this.validators = validators;

        this.valid = writable(validators.length === 0);
        this.touched = writable(false);
        this.focus = writable(false);
        this.errorMessage = writable(undefined);

        this._config = {
            validateOnInit: false,
            ...config,
        };

        if (this._config.validateOnInit) this.validate();
    }

    /**
     * Validate field.
     */
    validate = debounce(
        128,
        async () => {
            if (this.validators.length === 0) {
                this.valid.set(true);
                this.errorMessage.set(undefined);
                return;
            }

            let tempValid = true;

            for (const validator of this.validators) {
                const [valid, message] = await validator(get(this.value));
                tempValid = valid;

                if (!valid) {
                    this.errorMessage.set(message);
                    break;
                }
            }

            if (tempValid && typeof get(this.errorMessage) !== "undefined") {
                this.errorMessage.set(undefined);
            }

            this.valid.set(tempValid);
        },
        { atBegin: false },
    );

    /**
     * Handles field focus.
     */
    handleFocus = () => {
        this.touched.set(true);
        this.focus.set(true);
    };

    /**
     * Handles field input.
     */
    handleInput = () => {
        this.validate();
    };

    /**
     * Handles field blur.
     */
    handleBlur = () => {
        this.validate();
        this.focus.set(false);
    };

    /**
     * Handles setting an error message.
     */
    setErrorMessage = (message: string | undefined) => {
        this.validate.cancel({ upcomingOnly: true });
        this.errorMessage.set(message);
    };

    reset = () => {
        this.value.set(this._initialValue);
        this.touched.set(false);
        if (this._config.validateOnInit) this.validate();
    };
}
