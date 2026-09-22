import { get, type Writable, writable } from "svelte/store";
import { debounce } from "throttle-debounce";
import { Field } from "./field";

/**
 * FIX: Known issue where apparently this:
 * ```ts
 * const form = new Form({ bar: {...}, foo: new Field("") });
 * ```
 * does not validate the fields after `bar` fields object.
 */

/**
 * Form options.
 */
export interface FormOptions {
    /**
     * Useful when the form already have values set.
     * Defaults to `false`.
     */
    validateOnInit?: boolean;
}

/**
 * Helper type used to define all form field possibilities.
 */
type FormFields<T> = {
    [key: string]: T | FormFields<T> | Array<T> | Array<FormFields<T>>;
};

/**
 * Helper type used to infer field values.
 */
type MapFormFieldsValue<T extends FormFields<Field>> = {
    [K in keyof T]: T[K] extends Record<string, FormFields<Field>>
        ? MapFormFieldsValue<T[K]>
        : T[K] extends Field<infer V>
          ? V
          : never;
};

interface ErrorObject {
    [key: string]: string | ErrorObject;
}

export class Form<Fields extends FormFields<Field<any>>> {
    /**
     * Type guard for `Field`.
     */
    private static isField(value: unknown): value is Field {
        return value instanceof Field;
    }

    /**
     * Type guard for `Record<string, Field>`.
     */
    private static isFieldsRecord(value: unknown): value is Record<string, Field> {
        return typeof value === "object" && !Array.isArray(value) && !(value instanceof Field);
    }

    /**
     * Type guard for `Array<Field>`.
     */
    private static isFieldsArray(value: unknown): value is Array<Field> {
        if (!Array.isArray(value)) return false;

        for (const item of value) {
            if (!Form.isField(item)) return false;
        }

        return true;
    }

    /**
     * Type guard for `Array<FormFields<Field>>`.
     */
    private static isFormFieldsArray(value: unknown): value is Array<FormFields<Field>> {
        if (!Array.isArray(value)) return false;

        for (const item of value) {
            if (!Form.isFieldsRecord(item)) return false;
        }

        return true;
    }

    /**
     * Helper function used to extract form values recursevly.
     */
    private static getFieldsValues(fields: FormFields<Field>): unknown {
        return Object.keys(fields).reduce((prev, cur) => {
            const field = fields[cur];

            if (Form.isField(field)) {
                return {
                    ...prev,
                    [cur]: get(field.value),
                };
            } else if (Form.isFieldsRecord(field)) {
                return {
                    ...prev,
                    [cur]: Form.getFieldsValues(field),
                };
            }

            if (Form.isFieldsArray(field)) {
                const temp = field.map((item) => get(item.value));
                return {
                    ...prev,
                    [cur]: temp,
                };
            }

            if (Form.isFormFieldsArray(field)) {
                const temp = field.map((item) => Form.getFieldsValues(item));
                return {
                    ...prev,
                    [cur]: temp,
                };
            }

            return prev;
        }, {});
    }

    /**
     * Form options.
     */
    private _options: FormOptions;

    /**
     * Holds all form fields.
     */
    private _fields: Fields;
    get fields() {
        return this._fields;
    }

    /**
     * Holds form valid state.
     */
    valid: Writable<boolean>;

    /**
     * Resolves all fields values.
     */
    get values() {
        return Form.getFieldsValues(this.fields) as MapFormFieldsValue<Fields>;
    }

    constructor(fields: Fields, options: FormOptions = {}) {
        this._fields = fields;
        this.valid = writable(false);

        this.subscribeToValueChanges(fields);

        this._options = {
            validateOnInit: false,
            ...options,
        };

        if (this._options.validateOnInit) {
            this.validateFields();
            this.validate();
        }
    }

    /**
     * Subscribes to all form field values to validate the whole form.
     */
    subscribeToValueChanges = (fields: FormFields<Field>) => {
        Object.keys(fields).forEach((key) => {
            const field = fields[key];

            if (Form.isField(field)) {
                field.value.subscribe(this.validate);
                return;
            } else if (Form.isFieldsRecord(field)) {
                this.subscribeToValueChanges(field);
            } else if (Form.isFormFieldsArray(field)) {
                for (const item of field) {
                    this.subscribeToValueChanges(item);
                }
            } else if (Form.isFieldsArray(field)) {
                for (const item of field) {
                    item.value.subscribe(this.validate);
                }
            }
        });
    };

    /**
     * Validate form. This function doesn't run all fields validations.
     * To accomplish that, run `form.validate_fields()` before this function.
     */
    validate = debounce(
        256,
        () => {
            this.valid.update(() => {
                const validateFields = (fields: FormFields<Field>): boolean => {
                    for (const field of Object.values(fields)) {
                        if (Form.isField(field)) {
                            if (!get(field.valid)) {
                                return false;
                            }
                        } else if (Form.isFieldsRecord(field)) {
                            return validateFields(field);
                        } else if (Form.isFormFieldsArray(field)) {
                            for (const item of field) {
                                if (!validateFields(item)) {
                                    return false;
                                }
                            }
                        } else if (Form.isFieldsArray(field)) {
                            for (const item of field) {
                                if (!get(item.valid)) {
                                    return false;
                                }
                            }
                        }
                    }

                    return true;
                };

                return validateFields(this._fields);
            });
        },
        { atBegin: false },
    );

    /**
     * Validate all form fields.
     */
    validateFields = () => {
        const validate = (fields: FormFields<Field>): void => {
            for (const field of Object.values(fields)) {
                if (Form.isField(field)) {
                    field.validate();
                    continue;
                } else if (Form.isFieldsRecord(field)) {
                    validate(field);
                    continue;
                } else if (Form.isFormFieldsArray(field)) {
                    for (const item of field) {
                        validate(item);
                    }
                    continue;
                } else if (Form.isFieldsArray(field)) {
                    for (const item of field) {
                        item.validate();
                    }
                    continue;
                }
            }
        };

        validate(this._fields);
    };

    /**
     * Resets all form fields.
     */
    resetFields = () => {
        const reset = (fields: FormFields<Field>): void => {
            for (const field of Object.values(fields)) {
                if (Form.isField(field)) {
                    field.reset();
                    continue;
                } else if (Form.isFieldsRecord(field)) {
                    reset(field);
                    continue;
                } else if (Form.isFormFieldsArray(field)) {
                    for (const item of field) {
                        reset(item);
                    }
                    continue;
                } else if (Form.isFieldsArray(field)) {
                    for (const item of field) {
                        item.reset();
                    }
                    continue;
                }
            }
        };

        reset(this._fields);
    };

    handleErrors = (errors: ErrorObject, fields?: FormFields<Field>) => {
        for (const key of Object.keys(errors)) {
            const error = errors[key];
            const field = (fields || this._fields)[key];

            if (typeof error === "string" && Form.isField(field)) {
                field.setErrorMessage(error);
                field.valid.set(false);
            } else if (typeof error === "object" && Form.isFieldsRecord(field)) {
                this.handleErrors(error, field);
            }
            // TODO: Continue to handle more complex errors...
        }

        this.validate();
    };
}
