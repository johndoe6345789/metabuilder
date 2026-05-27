import { useRef, useEffect } from 'react';

export function useTerminalInputFocus(waitingForInput: boolean) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (waitingForInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [waitingForInput]);

  return inputRef;
}
