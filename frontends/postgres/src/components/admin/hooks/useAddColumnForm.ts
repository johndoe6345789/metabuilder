import { useState } from 'react';

type SubmitFn = (data: Record<string, unknown>) => Promise<void>;

export function useAddColumnForm(onSubmit: SubmitFn, onClose: () => void) {
  const [name, setName] = useState('');
  const [type, setType] = useState('VARCHAR');
  const [nullable, setNullable] = useState(true);
  const [defaultVal, setDefaultVal] = useState('');
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setName(''); setType('VARCHAR');
    setNullable(true); setDefaultVal('');
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    setBusy(true);
    try {
      await onSubmit({
        columnName: name,
        dataType: type,
        nullable,
        ...(defaultVal ? { defaultValue: defaultVal } : {}),
      });
      reset();
    } finally {
      setBusy(false);
    }
  };

  return {
    name, setName,
    type, setType,
    nullable, setNullable,
    defaultVal, setDefaultVal,
    busy,
    isValid: name.trim() !== '',
    handleClose,
    handleSubmit,
  };
}
