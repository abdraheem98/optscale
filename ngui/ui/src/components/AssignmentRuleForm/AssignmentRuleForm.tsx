import { Fragment, useEffect } from "react";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import { useForm, useFieldArray, Controller, FormProvider } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import AssignmentRuleFormNameInput from "components/AssignmentRuleForm/FormElements/AssignmentRuleFormNameInput";
import AssignmentRuleFormOwnerSelector from "components/AssignmentRuleForm/FormElements/AssignmentRuleFormOwnerSelector";
import AssignmentRuleFormPoolSelector from "components/AssignmentRuleForm/FormElements/AssignmentRuleFormPoolSelector";
import AssignmentRuleFormSubmitButton from "components/AssignmentRuleForm/FormElements/AssignmentRuleFormSubmitButton";
import Button from "components/Button";
import CheckboxLoader from "components/CheckboxLoader";
import IconButton from "components/IconButton";
import Input from "components/Input";
import InputLoader from "components/InputLoader";
import QuestionMark from "components/QuestionMark";
import Selector, { Item, ItemContent, ItemContentWithDataSourceIcon } from "components/Selector";
import {
  CONDITION_TYPES,
  CONDITION,
  TAG_IS,
  CLOUD_IS,
  TAG_VALUE_STARTS_WITH,
  TAG_EXISTS,
  DEFAULT_CONDITION,
  TAG_CONDITION,
  CLOUD_IS_CONDITION_VALUE,
  ARRAY_FORM_FIELD_FLEX_BASIS_WIDTH
} from "utils/constants";
import { SPACING_1 } from "utils/layouts";
import { notOnlyWhiteSpaces } from "utils/validation";
import useStyles from "./AssignmentRuleForm.styles";

const MAX_LENGTH = 255;

const CONDITIONS = "conditions";
const { KEY: TAG_KEY, VALUE: TAG_VALUE } = TAG_CONDITION;

const ACTIVE = "active";

const CLOUD_SELECTOR_LABEL_ID = "dataSource";

const POOL_SELECTOR_NAME = "poolId";
const OWNER_SELECTOR_NAME = "ownerId";

const { META_INFO, TYPE } = CONDITION;

const AssignmentRuleForm = ({
  onSubmit,
  onCancel,
  pools,
  cloudAccounts,
  isEdit = false,
  onPoolChange,
  poolOwners,
  defaultValues,
  isLoadingProps = {}
}) => {
  const { classes, cx } = useStyles();

  const intl = useIntl();

  const methods = useForm({
    // We need to pass defaultValues to useForm in order to reset the Controller components' value.
    // (defaultValues.poolId, defaultValues.ownerId are marked as required in the propTypes definition)
    // see https://react-hook-form.com/api#reset
    defaultValues,
    shouldUnregister: true
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = methods;

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const watchConditions = watch(CONDITIONS);

  const { fields, append, remove } = useFieldArray({
    control,
    name: CONDITIONS
  });

  const onFormSubmit = (data) => {
    const modifiedData = {
      ...data,
      [CONDITIONS]: data[CONDITIONS].map((item) => {
        if (item[`${META_INFO}_${TAG_KEY}`] || item[`${META_INFO}_${TAG_VALUE}`]) {
          return {
            [META_INFO]: JSON.stringify({
              key: item[`${META_INFO}_${TAG_KEY}`].trim(),
              value: item[`${META_INFO}_${TAG_VALUE}`].trim()
            }),
            [TYPE]: item[TYPE]
          };
        }
        if (item[`${META_INFO}_${CLOUD_IS_CONDITION_VALUE}`]) {
          return {
            [META_INFO]: item[`${META_INFO}_${CLOUD_IS_CONDITION_VALUE}`].trim(),
            [TYPE]: item[TYPE]
          };
        }

        return { ...item, meta_info: item.meta_info.trim() };
      })
    };

    onSubmit(modifiedData);
  };

  const renderInputField = (field, count, labelMessageId = "value") => (
    <Input
      className={classes.item}
      dataTestId={`input_${labelMessageId}_${count}`}
      defaultValue={field[META_INFO]}
      fullWidth={false}
      label={<FormattedMessage id={labelMessageId} />}
      required
      error={!!errors?.[CONDITIONS]?.[count]?.[META_INFO]}
      helperText={errors?.[CONDITIONS]?.[count]?.[META_INFO]?.message}
      {...register(`${CONDITIONS}.${count}.${META_INFO}`, {
        required: {
          value: true,
          message: intl.formatMessage({ id: "thisFieldIsRequired" })
        },
        maxLength: {
          value: MAX_LENGTH,
          message: intl.formatMessage({ id: "maxLength" }, { inputName: intl.formatMessage({ id: "value" }), max: MAX_LENGTH })
        },
        validate: { notOnlyWhiteSpaces }
      })}
    />
  );

  const renderKeyValueField = (field, count) => {
    const KEY_INPUT_NAME = `${META_INFO}_${TAG_KEY}`;
    const VALUE_INPUT_NAME = `${META_INFO}_${TAG_VALUE}`;

    const tagKeyError = errors?.[CONDITIONS]?.[count]?.[KEY_INPUT_NAME];
    const tagValueError = errors?.[CONDITIONS]?.[count]?.[VALUE_INPUT_NAME];

    return (
      <Box className={classes.item}>
        <Input
          defaultValue={field[KEY_INPUT_NAME]}
          fullWidth={false}
          label={<FormattedMessage id="key" />}
          dataTestId={`input_key_${count}`}
          required
          autoFocus={false}
          error={!!tagKeyError}
          helperText={tagKeyError && tagKeyError.message}
          {...register(`${CONDITIONS}.${count}.${KEY_INPUT_NAME}`, {
            required: {
              value: true,
              message: intl.formatMessage({ id: "thisFieldIsRequired" })
            },
            maxLength: {
              value: MAX_LENGTH,
              message: intl.formatMessage(
                { id: "maxLength" },
                { inputName: intl.formatMessage({ id: "key" }), max: MAX_LENGTH }
              )
            },
            validate: { notOnlyWhiteSpaces }
          })}
          className={cx(classes.spaceRight, classes.keyValueInput)}
        />
        <Input
          defaultValue={field[VALUE_INPUT_NAME]}
          fullWidth={false}
          label={<FormattedMessage id="value" />}
          dataTestId={`input_value_${count}`}
          required
          autoFocus={false}
          error={!!tagValueError}
          helperText={tagValueError && tagValueError.message}
          {...register(`${CONDITIONS}.${count}.${VALUE_INPUT_NAME}`, {
            required: {
              value: true,
              message: intl.formatMessage({ id: "thisFieldIsRequired" })
            },
            maxLength: {
              value: MAX_LENGTH,
              message: intl.formatMessage(
                { id: "maxLength" },
                { inputName: intl.formatMessage({ id: "value" }), max: MAX_LENGTH }
              )
            },
            validate: { notOnlyWhiteSpaces }
          })}
          className={classes.keyValueInput}
        />
      </Box>
    );
  };

  const renderCloudAccountSelector = (field, count) => {
    const NAME = `${META_INFO}_${CLOUD_IS_CONDITION_VALUE}`;
    const cloudSelectorError = errors?.[CONDITIONS]?.[count]?.[NAME];
    return (
      <Controller
        name={`${CONDITIONS}.${count}.${NAME}`}
        defaultValue={field[NAME] ?? ""}
        control={control}
        rules={{
          required: {
            value: true,
            message: intl.formatMessage({ id: "thisFieldIsRequired" })
          }
        }}
        render={({ field: controllerField }) => (
          <Selector
            id={`selector-cloud-account-${count}`}
            fullWidth
            error={!!cloudSelectorError}
            required
            helperText={cloudSelectorError && cloudSelectorError.message}
            labelMessageId={CLOUD_SELECTOR_LABEL_ID}
            {...controllerField}
          >
            {cloudAccounts.map(({ id, name, type }) => (
              <Item key={id} value={id}>
                <ItemContentWithDataSourceIcon dataSourceType={type}>{name}</ItemContentWithDataSourceIcon>
              </Item>
            ))}
          </Selector>
        )}
      />
    );
  };

  const conditionRow = (field, count) => {
    const typeError = errors?.[CONDITIONS]?.[count]?.[TYPE];
    const condition = watchConditions?.[count]?.[TYPE];

    const renderField = () => {
      switch (condition) {
        case TAG_IS:
        case TAG_VALUE_STARTS_WITH:
          return renderKeyValueField(field, count);
        case CLOUD_IS:
          return renderCloudAccountSelector(field, count);
        case TAG_EXISTS:
          return renderInputField(field, count, "key");
        default:
          return renderInputField(field, count);
      }
    };

    return (
      <Box display="flex" gap={SPACING_1} flexWrap="wrap">
        <Box flexBasis={ARRAY_FORM_FIELD_FLEX_BASIS_WIDTH.MEDIUM} flexGrow={1}>
          <Controller
            name={`${CONDITIONS}.${count}.${TYPE}`}
            defaultValue={field[TYPE]}
            control={control}
            render={({ field: controlledField }) => (
              <Selector
                id={`selector-type-${count}`}
                fullWidth
                required
                labelMessageId="type"
                error={!!typeError}
                helperText={typeError && typeError.message}
                {...controlledField}
              >
                {Object.entries(CONDITION_TYPES).map(([conditionType, conditionMessageId]) => (
                  <Item key={conditionType} value={conditionType}>
                    <ItemContent>
                      <FormattedMessage id={conditionMessageId} />
                    </ItemContent>
                  </Item>
                ))}
              </Selector>
            )}
          />
        </Box>
        <Box display="flex" flexBasis={ARRAY_FORM_FIELD_FLEX_BASIS_WIDTH.MEDIUM} flexGrow={2} gap={SPACING_1}>
          <Box flexGrow={1}>{renderField()}</Box>
          <Box>
            <FormControl className={cx(classes.item, classes.deleteButton)}>
              <IconButton
                color="error"
                icon={<DeleteOutlinedIcon />}
                onClick={() => (fields.length > 1 ? remove(count) : null)}
                tooltip={{
                  show: true,
                  value: <FormattedMessage id="delete" />
                }}
                dataTestId={`btn_delete_${count}`}
              />
            </FormControl>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onFormSubmit)} noValidate data-test-id="add_rule_form">
        {isLoadingProps.isActiveCheckboxLoading ? (
          <CheckboxLoader fullWidth />
        ) : (
          <FormControlLabel
            control={
              <Controller
                name={ACTIVE}
                control={control}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Checkbox
                    data-test-id="checkbox_active"
                    checked={value}
                    {...rest}
                    onChange={(event) => onChange(event.target.checked)}
                  />
                )}
              />
            }
            label={
              <span data-test-id="active_span">
                <FormattedMessage id="active" />
              </span>
            }
          />
        )}
        <AssignmentRuleFormNameInput isLoading={isLoadingProps.isNameInputLoading} />
        <Box display="flex" alignItems="center">
          <FormLabel data-test-id="lbl_conditions" required component="p">
            <FormattedMessage id="conditions" />
          </FormLabel>
          <QuestionMark dataTestId="conditions_help" messageId="assignmentRuleConditionsDescription" fontSize="small" />
        </Box>
        {isLoadingProps.isConditionsFieldLoading ? (
          <InputLoader fullWidth />
        ) : (
          fields.map((item, index) => <Fragment key={item.id}>{conditionRow(item, index)}</Fragment>)
        )}
        <FormControl fullWidth>
          <Button
            dashedBorder
            startIcon={<AddOutlinedIcon />}
            messageId="add"
            dataTestId="btn_add"
            size="large"
            color="primary"
            onClick={() => append(DEFAULT_CONDITION)}
          />
        </FormControl>
        <FormLabel data-test-id="lbl_assign" component="p">
          <FormattedMessage id="assignTo" />
        </FormLabel>
        <AssignmentRuleFormPoolSelector
          name={POOL_SELECTOR_NAME}
          ownerSelectorName={OWNER_SELECTOR_NAME}
          pools={pools}
          onPoolChange={onPoolChange}
          isLoading={isLoadingProps.isPoolSelectorLoading}
        />
        <AssignmentRuleFormOwnerSelector
          name={OWNER_SELECTOR_NAME}
          poolOwners={poolOwners}
          pools={pools}
          currentPool
          poolSelectorName={POOL_SELECTOR_NAME}
          isFormDataLoading={isLoadingProps.isOwnerSelectorLoading}
        />
        <AssignmentRuleFormSubmitButton isLoading={isLoadingProps.isSubmitButtonLoading} isEdit={isEdit} onCancel={onCancel} />
      </form>
    </FormProvider>
  );
};

export default AssignmentRuleForm;
