import { useState } from 'react'
import { House, Pencil, User } from '@phosphor-icons/react'
import showcaseCopy from '@/data/atomic-showcase/showcase.json'
import tabsCopy from '@/data/atomic-showcase/tabs.json'
import { FormsTab } from '@/components/atomic-showcase/FormsTab'
import { DisplayTab } from '@/components/atomic-showcase/DisplayTab'
import { TypographyTab } from '@/components/atomic-showcase/TypographyTab'
import { Container, Heading, Section, Stack, Tabs, Text } from '@/components/atoms'

const tabIcons = {
  house: <House />,
  pencil: <Pencil />,
  user: <User />,
}

export function AtomicComponentShowcase() {
  const [toggleValue, setToggleValue] = useState(false)
  const [checkboxValue, setCheckboxValue] = useState(false)
  const [radioValue, setRadioValue] = useState('md')
  const [sliderValue, setSliderValue] = useState(50)
  const [ratingValue, setRatingValue] = useState(3)
  const [inputValue, setInputValue] = useState('')
  const [searchValue, setSearchValue] = useState('')
  const [passwordValue, setPasswordValue] = useState('')
  const [textAreaValue, setTextAreaValue] = useState('')
  const [selectValue, setSelectValue] = useState('')
  const [activeTab, setActiveTab] = useState('typography')
  const [selectedColor, setSelectedColor] = useState('#8b5cf6')

  const tabs = tabsCopy.map((tab) => ({
    ...tab,
    icon: tabIcons[tab.icon as keyof typeof tabIcons],
  }))

  return (
    <Container size="xl" className="py-8">
      <Stack spacing="xl">
        <Section>
          <Heading level={1}>{showcaseCopy.title}</Heading>
          <Text variant="muted">{showcaseCopy.description}</Text>
        </Section>

        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="pills" />

        {activeTab === 'typography' && <TypographyTab />}

        {activeTab === 'forms' && (
          <FormsTab
            checkboxValue={checkboxValue}
            inputValue={inputValue}
            passwordValue={passwordValue}
            radioValue={radioValue}
            searchValue={searchValue}
            selectValue={selectValue}
            sliderValue={sliderValue}
            textAreaValue={textAreaValue}
            toggleValue={toggleValue}
            onCheckboxChange={setCheckboxValue}
            onInputChange={setInputValue}
            onPasswordChange={setPasswordValue}
            onRadioChange={setRadioValue}
            onSearchChange={setSearchValue}
            onSelectChange={setSelectValue}
            onSliderChange={setSliderValue}
            onTextAreaChange={setTextAreaValue}
            onToggleChange={setToggleValue}
          />
        )}

        {activeTab === 'display' && (
          <DisplayTab
            ratingValue={ratingValue}
            selectedColor={selectedColor}
            onRatingChange={setRatingValue}
            onColorChange={setSelectedColor}
          />
        )}
      </Stack>
    </Container>
  )
}
