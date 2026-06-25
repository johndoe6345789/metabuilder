import { useState } from 'react';

type SubmitFn = (data: Record<string, unknown>) => Promise<void>;

export function useDropColumnForm(onSubmit: SubmitFn, onClose: () => void) {
  const [selected, setSelected] = useState('');
  const [busy, setBusy] = useState(false);

  const handleClose = () => { setSelected(''); onClose(); };

  const handleSubmit = async () => {
    setBusy(true);
    try {
      await onSubmit({ columnName: selected });
      setSelected('');
    } finally {
      setBusy(false);
    }
  };

  return {
    selected, setSelected,
    busy,
    isValid: selected !== '',
    handleClose,
    handleSubmit,
  };
}
