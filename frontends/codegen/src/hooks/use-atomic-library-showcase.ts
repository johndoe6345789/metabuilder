import { useState } from 'react'
import data from '@/data/atomic-library-showcase.json'

export function useAtomicLibraryShowcase() {
  const [switchChecked, setSwitchChecked] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [rangeValue, setRangeValue] = useState<[number, number]>([20, 80])
  const [filterValue, setFilterValue] = useState('')
  const [rating, setRating] = useState(3)
  const [numberValue, setNumberValue] = useState(10)

  return {
    switchChecked,
    setSwitchChecked,
    selectedDate,
    setSelectedDate,
    rangeValue,
    setRangeValue,
    filterValue,
    setFilterValue,
    rating,
    setRating,
    numberValue,
    setNumberValue,
    pageHeader: data.pageHeader,
    sections: data.sections,
  }
}
