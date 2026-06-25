/** toolbarHandlers - Async handlers for ExecutionToolbar */

type ValidateFn = () => Promise<{ valid: boolean }>;
type ExecuteFn = (id: string) => Promise<void>;
type SetLoadingFn = (v: boolean) => void;
type SetMessageFn = (v: string | null) => void;

export async function doSave(
  save: () => Promise<void>
): Promise<void> {
  try {
    await save();
  } catch (error) {
    console.error('Failed to save:', error);
  }
}

export async function doExecute(
  workflowId: string,
  validate: ValidateFn,
  execute: ExecuteFn,
  setLoading: SetLoadingFn,
  setLoadingMessage: SetMessageFn,
  onValidationShow?: (show: boolean) => void
): Promise<void> {
  try {
    setLoading(true);
    setLoadingMessage('Validating workflow...');
    const validation = await validate();
    if (!validation.valid) {
      onValidationShow?.(true);
      setLoading(false);
      return;
    }
    setLoadingMessage('Executing workflow...');
    await execute(workflowId);
  } catch (error) {
    console.error('Failed to execute:', error);
  } finally {
    setLoading(false);
    setLoadingMessage(null);
  }
}

export async function doValidate(
  validate: ValidateFn,
  onValidationShow?: (show: boolean) => void
): Promise<void> {
  try {
    await validate();
    onValidationShow?.(true);
  } catch (error) {
    console.error('Failed to validate:', error);
  }
}
