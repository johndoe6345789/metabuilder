/**
 * Form JSON components — buttons, inputs, selects, toggles, etc.
 */
import { createJsonComponent } from './create-json-component'
import type {
  ActionButtonProps,
  ButtonGroupProps,
  ButtonProps,
  CalendarProps,
  CheckboxProps,
  ConfirmButtonProps,
  DatePickerProps,
  FormFieldProps,
  FormProps,
  IconButtonProps,
  InputOTPProps,
  NumberInputProps,
  QuickActionButtonProps,
  RadioGroupProps,
  RangeSliderProps,
  SelectProps,
  SliderProps,
  SwitchProps,
  TextAreaProps,
  ToggleProps,
} from './interfaces'

import actionButtonDef from '@/components/json-definitions/action-button.json'
import buttonGroupDef from '@/components/json-definitions/button-group.json'
import buttonDef from '@/components/json-definitions/button.json'
import calendarDef from '@/components/json-definitions/calendar.json'
import checkboxDef from '@/components/json-definitions/checkbox.json'
import confirmButtonDef from '@/components/json-definitions/confirm-button.json'
import datePickerDef from '@/components/json-definitions/date-picker.json'
import formDef from '@/components/json-definitions/form.json'
import formFieldDef from '@/components/json-definitions/form-field.json'
import iconButtonDef from '@/components/json-definitions/icon-button.json'
import inputOtpDef from '@/components/json-definitions/input-otp.json'
import numberInputDef from '@/components/json-definitions/number-input.json'
import quickActionButtonDef from
  '@/components/json-definitions/quick-action-button.json'
import radioGroupDef from '@/components/json-definitions/radio-group.json'
import rangeSliderDef from '@/components/json-definitions/range-slider.json'
import selectDef from '@/components/json-definitions/select.json'
import sliderDef from '@/components/json-definitions/slider.json'
import switchDef from '@/components/json-definitions/switch.json'
import textareaDef from '@/components/json-definitions/textarea.json'
import toggleDef from '@/components/json-definitions/toggle.json'

export const MetabuilderFormActionButton =
  createJsonComponent<ActionButtonProps>(actionButtonDef)
export const MetabuilderFormButtonGroup =
  createJsonComponent<ButtonGroupProps>(buttonGroupDef)
export const MetabuilderFormButton =
  createJsonComponent<ButtonProps>(buttonDef)
export const MetabuilderWidgetCalendar =
  createJsonComponent<CalendarProps>(calendarDef)
export const MetabuilderFormCheckbox =
  createJsonComponent<CheckboxProps>(checkboxDef)
export const MetabuilderFormConfirmButton =
  createJsonComponent<ConfirmButtonProps>(confirmButtonDef)
export const MetabuilderFormDatePicker =
  createJsonComponent<DatePickerProps>(datePickerDef)
export const MetabuilderFormForm =
  createJsonComponent<FormProps>(formDef)
export const MetabuilderFormFormField =
  createJsonComponent<FormFieldProps>(formFieldDef)
export const MetabuilderFormIconButton =
  createJsonComponent<IconButtonProps>(iconButtonDef)
export const MetabuilderFormInputOTP =
  createJsonComponent<InputOTPProps>(inputOtpDef)
export const MetabuilderFormNumberInput =
  createJsonComponent<NumberInputProps>(numberInputDef)
export const MetabuilderFormQuickActionButton =
  createJsonComponent<QuickActionButtonProps>(
    quickActionButtonDef,
  )
export const MetabuilderFormRadioGroup =
  createJsonComponent<RadioGroupProps>(radioGroupDef)
export const MetabuilderFormRangeSlider =
  createJsonComponent<RangeSliderProps>(rangeSliderDef)
export const MetabuilderFormSelect =
  createJsonComponent<SelectProps>(selectDef)
export const MetabuilderFormSlider =
  createJsonComponent<SliderProps>(sliderDef)
export const MetabuilderFormSwitch =
  createJsonComponent<SwitchProps>(switchDef)
export const MetabuilderFormTextArea =
  createJsonComponent<TextAreaProps>(textareaDef)
export const MetabuilderFormToggle =
  createJsonComponent<ToggleProps>(toggleDef)
