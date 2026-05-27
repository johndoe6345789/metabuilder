/**
 * useStorageExample
 *
 * State and CRUD handlers for the StorageExample
 * component demo (counter + todo list).
 */

import { useState } from 'react'
import { useStorage } from '@/hooks/use-storage'

interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: number
}

export function useStorageExample() {
  const [newTodoText, setNewTodoText] = useState('')
  const [todos, setTodos] = useStorage<Todo[]>(
    'example-todos',
    []
  )
  const [counter, setCounter] = useStorage<number>(
    'example-counter',
    0
  )

  const addTodo = () => {
    if (!newTodoText.trim()) return
    setTodos((current) => [
      ...current,
      {
        id: Date.now().toString(),
        text: newTodoText,
        completed: false,
        createdAt: Date.now(),
      },
    ])
    setNewTodoText('')
  }

  const toggleTodo = (id: string) => {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id
          ? { ...todo, completed: !todo.completed }
          : todo
      )
    )
  }

  const deleteTodo = (id: string) => {
    setTodos((current) =>
      current.filter((todo) => todo.id !== id)
    )
  }

  const incrementCounter = () => {
    setCounter((current) => current + 1)
  }

  return {
    todos,
    counter,
    newTodoText,
    setNewTodoText,
    addTodo,
    toggleTodo,
    deleteTodo,
    incrementCounter,
  }
}
