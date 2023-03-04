/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, TextFieldProps } from "@aws-amplify/ui-react";
import { EscapeHatchProps } from "@aws-amplify/ui-react/internal";
import { Universe } from "../models";
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type UniverseUpdateFormInputValues = {
    name?: string;
    icon?: string;
};
export declare type UniverseUpdateFormValidationValues = {
    name?: ValidationFunction<string>;
    icon?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type UniverseUpdateFormOverridesProps = {
    UniverseUpdateFormGrid?: PrimitiveOverrideProps<GridProps>;
    name?: PrimitiveOverrideProps<TextFieldProps>;
    icon?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type UniverseUpdateFormProps = React.PropsWithChildren<{
    overrides?: UniverseUpdateFormOverridesProps | undefined | null;
} & {
    id?: string;
    universe?: Universe;
    onSubmit?: (fields: UniverseUpdateFormInputValues) => UniverseUpdateFormInputValues;
    onSuccess?: (fields: UniverseUpdateFormInputValues) => void;
    onError?: (fields: UniverseUpdateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: UniverseUpdateFormInputValues) => UniverseUpdateFormInputValues;
    onValidate?: UniverseUpdateFormValidationValues;
} & React.CSSProperties>;
export default function UniverseUpdateForm(props: UniverseUpdateFormProps): React.ReactElement;
