/**
 * Tests for toolbarHandlers - pure async handler functions
 */

import { doSave, doExecute, doValidate } from '../toolbarHandlers';

describe('doSave', () => {
  it('calls save and resolves successfully', async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    await doSave(save);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('catches and logs save errors without throwing', async () => {
    const save = jest.fn().mockRejectedValue(new Error('save failed'));
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(doSave(save)).resolves.toBeUndefined();
    expect(consoleError).toHaveBeenCalledWith('Failed to save:', expect.any(Error));
    consoleError.mockRestore();
  });
});

describe('doExecute', () => {
  const makeArgs = (overrides: Record<string, any> = {}) => ({
    workflowId: 'wf-1',
    validate: jest.fn().mockResolvedValue({ valid: true }),
    execute: jest.fn().mockResolvedValue(undefined),
    setLoading: jest.fn(),
    setLoadingMessage: jest.fn(),
    onValidationShow: jest.fn(),
    ...overrides,
  });

  it('calls validate, execute, and clears loading on success', async () => {
    const args = makeArgs();
    await doExecute(
      args.workflowId, args.validate, args.execute,
      args.setLoading, args.setLoadingMessage, args.onValidationShow
    );
    expect(args.setLoading).toHaveBeenCalledWith(true);
    expect(args.validate).toHaveBeenCalled();
    expect(args.execute).toHaveBeenCalledWith('wf-1');
    expect(args.setLoading).toHaveBeenCalledWith(false);
    expect(args.setLoadingMessage).toHaveBeenCalledWith(null);
  });

  it('shows validation panel and aborts execute when validation fails', async () => {
    const args = makeArgs({
      validate: jest.fn().mockResolvedValue({ valid: false }),
    });
    await doExecute(
      args.workflowId, args.validate, args.execute,
      args.setLoading, args.setLoadingMessage, args.onValidationShow
    );
    expect(args.onValidationShow).toHaveBeenCalledWith(true);
    expect(args.execute).not.toHaveBeenCalled();
    expect(args.setLoading).toHaveBeenCalledWith(false);
  });

  it('works without onValidationShow callback when validation fails', async () => {
    const args = makeArgs({
      validate: jest.fn().mockResolvedValue({ valid: false }),
      onValidationShow: undefined,
    });
    await expect(doExecute(
      args.workflowId, args.validate, args.execute,
      args.setLoading, args.setLoadingMessage
    )).resolves.toBeUndefined();
  });

  it('catches errors and still clears loading', async () => {
    const args = makeArgs({
      validate: jest.fn().mockRejectedValue(new Error('network error')),
    });
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    await doExecute(
      args.workflowId, args.validate, args.execute,
      args.setLoading, args.setLoadingMessage, args.onValidationShow
    );
    expect(args.setLoading).toHaveBeenCalledWith(false);
    expect(args.setLoadingMessage).toHaveBeenCalledWith(null);
    consoleError.mockRestore();
  });

  it('sets loading message to Validating and then Executing', async () => {
    const messages: string[] = [];
    const args = makeArgs({
      setLoadingMessage: jest.fn((msg) => messages.push(msg)),
    });
    await doExecute(
      args.workflowId, args.validate, args.execute,
      args.setLoading, args.setLoadingMessage, args.onValidationShow
    );
    expect(messages[0]).toBe('Validating workflow...');
    expect(messages[1]).toBe('Executing workflow...');
  });
});

describe('doValidate', () => {
  it('calls validate and shows the panel on success', async () => {
    const validate = jest.fn().mockResolvedValue({ valid: true });
    const onValidationShow = jest.fn();
    await doValidate(validate, onValidationShow);
    expect(validate).toHaveBeenCalled();
    expect(onValidationShow).toHaveBeenCalledWith(true);
  });

  it('works without onValidationShow', async () => {
    const validate = jest.fn().mockResolvedValue({ valid: true });
    await expect(doValidate(validate)).resolves.toBeUndefined();
  });

  it('catches validation errors without throwing', async () => {
    const validate = jest.fn().mockRejectedValue(new Error('validate failed'));
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(doValidate(validate)).resolves.toBeUndefined();
    expect(consoleError).toHaveBeenCalledWith('Failed to validate:', expect.any(Error));
    consoleError.mockRestore();
  });
});
