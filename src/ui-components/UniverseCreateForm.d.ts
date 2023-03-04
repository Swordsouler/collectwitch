/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, TextFieldProps } from "@aws-amplify/ui-react";
import { EscapeHatchProps } from "@aws-amplify/ui-react/internal";
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type UniverseCreateFormInputValues = {
    name?: string;
    icon?: string;
};
export declare type UniverseCreateFormValidationValues = {
    name?: ValidationFunction<string>;
    icon?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type UniverseCreateFormOverridesProps = {
    UniverseCreateFormGrid?: PrimitiveOverrideProps<GridProps>;
    name?: PrimitiveOverrideProps<TextFieldProps>;
    icon?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type UniverseCreateFormProps = React.PropsWithChildren<{
    overrides?: UniverseCreateFormOverridesProps | undefined | null;
} & {
    clearOnSuccess?: boolean;
    onSubmit?: (fields: UniverseCreateFormInputValues) => UniverseCreateFormInputValues;
    onSuccess?: (fields: UniverseCreateFormInputValues) => void;
    onError?: (fields: UniverseCreateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: UniverseCreateFormInputValues) => UniverseCreateFormInputValues;
    onValidate?: UniverseCreateFormValidationValues;
} & React.CSSProperties>;
export default function UniverseCreateForm(props: UniverseCreateFormProps): React.ReactElement;
