import { useState } from 'react';

type SubmitFn = (data: Record<string, unknown>) => Promise<void>;

export function useModifyColumnForm(onSubmit: SubmitFn, onClose: () => void) {
  const [selected, setSelected] = useState('');
  const [type, setType] = useState('VARCHAR');
  const [nullable, setNullable] = useState(true);
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setSelected(''); setType('VARCHAR'); setNullable(true);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    setBusy(true);
    try {
      await onSubmit({ columnName: selected, newType: type, nullable });
      reset();
    } finally {
      setBusy(false);
    }
  };

  return {
    selected, setSelected,
    type, setType,
    nullable, setNullable,
    busy,
    isValid: selected !== '',
    handleClose,
    handleSubmit,
  };
}
