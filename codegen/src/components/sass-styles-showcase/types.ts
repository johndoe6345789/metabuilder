export type ButtonRowItem = {
  label: string
  className: string
}

export type ButtonsTabData = {
  label: string
  title: string
  rows: ButtonRowItem[][]
  codeSample: string
}

export type InputsTabData = {
  label: string
  title: string
  fields: Array<{ placeholder: string; className: string }>
  codeSample: string
}

export type CardsTabData = {
  label: string
  title: string
  items: Array<{
    title: string
    description: string
    className: string
    descriptionClassName: string
  }>
  codeSample: string
}

export type ChipsTabData = {
  label: string
  chipCardTitle: string
  chips: Array<{ label: string; className: string; showIcon?: boolean }>
  codeSample: string
  tagCardTitle: string
  tags: Array<{ label: string; className: string }>
}

export type LayoutSectionItem = {
  label: string
  className?: string
}

export type LayoutSection = {
  title: string
  containerClassName: string
  itemTag?: 'div' | 'p'
  items: LayoutSectionItem[]
}

export type LayoutTabData = {
  label: string
  title: string
  sections: LayoutSection[]
  codeSample: string
}

export type AnimationsTabData = {
  label: string
  title: string
  items: Array<{ label: string; className: string }>
  codeSample: string
  skeletonTitle: string
  skeletonClasses: string[]
}

export type SassStylesShowcaseData = {
  page: {
    title: string
    description: string
  }
  tabOrder: Array<'buttons' | 'inputs' | 'cards' | 'chips' | 'layout' | 'animations'>
  tabs: {
    buttons: ButtonsTabData
    inputs: InputsTabData
    cards: CardsTabData
    chips: ChipsTabData
    layout: LayoutTabData
    animations: AnimationsTabData
  }
}
