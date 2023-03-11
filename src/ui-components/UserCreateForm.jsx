/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

/* eslint-disable */
import * as React from "react";
import {
  Button,
  Flex,
  Grid,
  SwitchField,
  TextField,
} from "@aws-amplify/ui-react";
import { getOverrideProps } from "@aws-amplify/ui-react/internal";
import { User } from "../models";
import { fetchByPath, validateField } from "./utils";
import { DataStore } from "aws-amplify";
export default function UserCreateForm(props) {
  const {
    clearOnSuccess = true,
    onSuccess,
    onError,
    onSubmit,
    onValidate,
    onChange,
    overrides,
    ...rest
  } = props;
  const initialValues = {
    twitchID: "",
    username: "",
    streamer: false,
  };
  const [twitchID, setTwitchID] = React.useState(initialValues.twitchID);
  const [username, setUsername] = React.useState(initialValues.username);
  const [streamer, setStreamer] = React.useState(initialValues.streamer);
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    setTwitchID(initialValues.twitchID);
    setUsername(initialValues.username);
    setStreamer(initialValues.streamer);
    setErrors({});
  };
  const validations = {
    twitchID: [{ type: "Required" }],
    username: [{ type: "Required" }],
    streamer: [{ type: "Required" }],
  };
  const runValidationTasks = async (
    fieldName,
    currentValue,
    getDisplayValue
  ) => {
    const value =
      currentValue && getDisplayValue
        ? getDisplayValue(currentValue)
        : currentValue;
    let validationResponse = validateField(value, validations[fieldName]);
    const customValidator = fetchByPath(onValidate, fieldName);
    if (customValidator) {
      validationResponse = await customValidator(value, validationResponse);
    }
    setErrors((errors) => ({ ...errors, [fieldName]: validationResponse }));
    return validationResponse;
  };
  return (
    <Grid
      as="form"
      rowGap="15px"
      columnGap="15px"
      padding="20px"
      onSubmit={async (event) => {
        event.preventDefault();
        let modelFields = {
          twitchID,
          username,
          streamer,
        };
        const validationResponses = await Promise.all(
          Object.keys(validations).reduce((promises, fieldName) => {
            if (Array.isArray(modelFields[fieldName])) {
              promises.push(
                ...modelFields[fieldName].map((item) =>
                  runValidationTasks(fieldName, item)
                )
              );
              return promises;
            }
            promises.push(
              runValidationTasks(fieldName, modelFields[fieldName])
            );
            return promises;
          }, [])
        );
        if (validationResponses.some((r) => r.hasError)) {
          return;
        }
        if (onSubmit) {
          modelFields = onSubmit(modelFields);
        }
        try {
          Object.entries(modelFields).forEach(([key, value]) => {
            if (typeof value === "string" && value.trim() === "") {
              modelFields[key] = undefined;
            }
          });
          await DataStore.save(new User(modelFields));
          if (onSuccess) {
            onSuccess(modelFields);
          }
          if (clearOnSuccess) {
            resetStateValues();
          }
        } catch (err) {
          if (onError) {
            onError(modelFields, err.message);
          }
        }
      }}
      {...getOverrideProps(overrides, "UserCreateForm")}
      {...rest}
    >
      <TextField
        label="Twitch id"
        isRequired={true}
        isReadOnly={false}
        value={twitchID}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              twitchID: value,
              username,
              streamer,
            };
            const result = onChange(modelFields);
            value = result?.twitchID ?? value;
          }
          if (errors.twitchID?.hasError) {
            runValidationTasks("twitchID", value);
          }
          setTwitchID(value);
        }}
        onBlur={() => runValidationTasks("twitchID", twitchID)}
        errorMessage={errors.twitchID?.errorMessage}
        hasError={errors.twitchID?.hasError}
        {...getOverrideProps(overrides, "twitchID")}
      ></TextField>
      <TextField
        label="Username"
        isRequired={true}
        isReadOnly={false}
        value={username}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              twitchID,
              username: value,
              streamer,
            };
            const result = onChange(modelFields);
            value = result?.username ?? value;
          }
          if (errors.username?.hasError) {
            runValidationTasks("username", value);
          }
          setUsername(value);
        }}
        onBlur={() => runValidationTasks("username", username)}
        errorMessage={errors.username?.errorMessage}
        hasError={errors.username?.hasError}
        {...getOverrideProps(overrides, "username")}
      ></TextField>
      <SwitchField
        label="Streamer"
        defaultChecked={false}
        isDisabled={false}
        isChecked={streamer}
        onChange={(e) => {
          let value = e.target.checked;
          if (onChange) {
            const modelFields = {
              twitchID,
              username,
              streamer: value,
            };
            const result = onChange(modelFields);
            value = result?.streamer ?? value;
          }
          if (errors.streamer?.hasError) {
            runValidationTasks("streamer", value);
          }
          setStreamer(value);
        }}
        onBlur={() => runValidationTasks("streamer", streamer)}
        errorMessage={errors.streamer?.errorMessage}
        hasError={errors.streamer?.hasError}
        {...getOverrideProps(overrides, "streamer")}
      ></SwitchField>
      <Flex
        justifyContent="space-between"
        {...getOverrideProps(overrides, "CTAFlex")}
      >
        <Button
          children="Clear"
          type="reset"
          onClick={(event) => {
            event.preventDefault();
            resetStateValues();
          }}
          {...getOverrideProps(overrides, "ClearButton")}
        ></Button>
        <Flex
          gap="15px"
          {...getOverrideProps(overrides, "RightAlignCTASubFlex")}
        >
          <Button
            children="Submit"
            type="submit"
            variation="primary"
            isDisabled={Object.values(errors).some((e) => e?.hasError)}
            {...getOverrideProps(overrides, "SubmitButton")}
          ></Button>
        </Flex>
      </Flex>
    </Grid>
  );
}
