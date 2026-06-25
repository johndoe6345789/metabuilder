/** switchDbTypes - Types for SwitchDbCard */

export interface TestResult {
  ok: boolean;
  message: string;
}

export interface SwitchDbCardProps {
  selectedAdapter: string;
  formFields: Record<string, string>;
  testing: boolean;
  switching: boolean;
  testResult: TestResult | null;
  switchResult: TestResult | null;
  defaultPorts: Record<string, string>;
  onAdapterChange: (adapter: string) => void;
  onFieldChange: (field: string, value: string) => void;
  onTestConnection: () => void;
  onApply: () => void;
}
