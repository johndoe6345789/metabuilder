import { Envelope, Heart, Share, Trash } from '@phosphor-icons/react'
import formsCopy from '@/data/atomic-showcase/forms.json'
import {
  ActionButton,
  Card,
  Checkbox,
  Divider,
  Heading,
  IconButton,
  Stack,
  TextArea,
  Toggle,
} from '@/components/atoms'
import {
  Input,
  CopyButton,
  FileUpload,
  PasswordInput,
  SearchInput,
  Slider,
  Select,
  RadioGroup,
} from '@/lib/json-ui/json-components'

type FormsTabProps = {
  checkboxValue: boolean
  inputValue: string
  passwordValue: string
  radioValue: string
  searchValue: string
  selectValue: string
  sliderValue: number
  textAreaValue: string
  toggleValue: boolean
  onCheckboxChange: (value: boolean) => void
  onInputChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onRadioChange: (value: string) => void
  onSearchChange: (value: string) => void
  onSelectChange: (value: string) => void
  onSliderChange: (value: number) => void
  onTextAreaChange: (value: string) => void
  onToggleChange: (value: boolean) => void
}

const actionIcons = [<Heart key="heart" />, <Share key="share" />]
const iconButtons = [<Heart key="heart" />, <Share key="share" />, <Trash key="trash" />]

export function FormsTab(props: FormsTabProps) {
  const {
    checkboxValue,
    inputValue,
    passwordValue,
    radioValue,
    searchValue,
    selectValue,
    sliderValue,
    textAreaValue,
    toggleValue,
    onCheckboxChange,
    onInputChange,
    onPasswordChange,
    onRadioChange,
    onSearchChange,
    onSelectChange,
    onSliderChange,
    onTextAreaChange,
    onToggleChange,
  } = props

  return (
    <Stack spacing="lg">
      <Card variant="bordered" padding="lg">
        <Stack spacing="md">
          <Heading level={2}>{formsCopy.formTitle}</Heading>
          <Divider />
          <Input
            label={formsCopy.email.label}
            placeholder={formsCopy.email.placeholder}
            value={inputValue}
            onChange={(event) => onInputChange(event.target.value)}
            leftIcon={<Envelope size={18} />}
            helperText={formsCopy.email.helperText}
          />
          <PasswordInput label={formsCopy.password.label} value={passwordValue} onChange={onPasswordChange} helperText={formsCopy.password.helperText} />
          <SearchInput value={searchValue} onChange={onSearchChange} placeholder={formsCopy.search.placeholder} />
          <TextArea
            label={formsCopy.textArea.label}
            placeholder={formsCopy.textArea.placeholder}
            value={textAreaValue}
            onChange={(event) => onTextAreaChange(event.target.value)}
            helperText={formsCopy.textArea.helperText}
          />
          <Select
            label={formsCopy.select.label}
            value={selectValue}
            onChange={onSelectChange}
            options={formsCopy.select.options}
            placeholder={formsCopy.select.placeholder}
          />
          <Divider />
          <Toggle checked={toggleValue} onChange={onToggleChange} label={formsCopy.toggle.label} />
          <Checkbox checked={checkboxValue} onChange={onCheckboxChange} label={formsCopy.checkbox.label} />
          <RadioGroup name={formsCopy.radio.name} value={radioValue} onChange={onRadioChange} options={formsCopy.radio.options} orientation="horizontal" />
          <Slider label={formsCopy.slider.label} value={sliderValue} onChange={onSliderChange} min={formsCopy.slider.min} max={formsCopy.slider.max} showValue />
        </Stack>
      </Card>
      <Card variant="bordered" padding="lg">
        <Stack spacing="md">
          <Heading level={2}>{formsCopy.buttonTitle}</Heading>
          <Divider />
          <Stack direction="horizontal" spacing="sm" wrap>
            {formsCopy.buttons.map((button) => (
              <ActionButton key={button.label} label={button.label} variant={button.variant as any} onClick={() => {}} />
            ))}
          </Stack>
          <Stack direction="horizontal" spacing="sm">
            {formsCopy.iconActions.map((action, index) => (
              <ActionButton key={action.label} label={action.label} icon={actionIcons[index]} variant={action.variant as any} onClick={() => {}} />
            ))}
          </Stack>
          <Stack direction="horizontal" spacing="sm">
            {formsCopy.iconButtons.map((button, index) => (
              <IconButton key={`${button.variant}-${index}`} icon={iconButtons[index]} variant={button.variant as any} onClick={() => {}} />
            ))}
          </Stack>
          <CopyButton text={formsCopy.copyButtonText} size="md" />
        </Stack>
      </Card>
      <Card variant="bordered" padding="lg">
        <Stack spacing="md">
          <Heading level={2}>{formsCopy.fileUploadTitle}</Heading>
          <Divider />
          <FileUpload accept={formsCopy.fileUploadAccept} multiple onFilesSelected={(files) => console.log(files)} />
        </Stack>
      </Card>
    </Stack>
  )
}
