import { useCallback, useEffect, useState } from 'react'

export interface EditorState {
  title: string
  content: string
  isDirty: boolean
  setTitle: (title: string) => void
  setContent: (content: string) => void
  markSaved: () => void
  reset: (title: string, content: string) => void
}

export function useEditorState(initialTitle = '', initialContent = ''): EditorState {
  const [title, setTitleState] = useState(initialTitle)
  const [content, setContentState] = useState(initialContent)
  const [isDirty, setIsDirty] = useState(false)

  const setTitle = useCallback((value: string) => {
    setTitleState(value)
    setIsDirty(true)
  }, [])

  const setContent = useCallback((value: string) => {
    setContentState(value)
    setIsDirty(true)
  }, [])

  const markSaved = useCallback(() => {
    setIsDirty(false)
  }, [])

  const reset = useCallback((nextTitle: string, nextContent: string) => {
    setTitleState(nextTitle)
    setContentState(nextContent)
    setIsDirty(false)
  }, [])

  useEffect(() => {
    if (!isDirty) {
      return
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  return { title, content, isDirty, setTitle, setContent, markSaved, reset }
}
