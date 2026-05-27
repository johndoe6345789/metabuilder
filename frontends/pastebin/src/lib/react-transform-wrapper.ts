/**
 * Builds the eval wrapper string for React component transformation
 */

export function buildWrapperCode(
  transformedCode: string,
  componentToReturn: string | undefined
): string {
  const returnStmt = componentToReturn
    ? `return ${componentToReturn};`
    : `return null;`
  return `
    (function() {
      const React = arguments[0];
      const { useState, useEffect, useRef, useMemo, useCallback, useReducer, useContext } = React;
      const Button = arguments[1];
      const Card = arguments[2];
      const CardContent = arguments[3];
      const CardHeader = arguments[4];
      const CardActions = arguments[5];
      const CardTitle = ({ children, className }) => React.createElement('h3', { className, style: { fontWeight: 600, fontSize: '1.125rem' } }, children);
      const CardDescription = ({ children, className }) => React.createElement('p', { className, style: { color: 'var(--mat-sys-on-surface-variant, #6b7280)', fontSize: '0.875rem' } }, children);
      const CardFooter = CardActions;
      const Input = arguments[6];
      const Label = arguments[7];
      const Textarea = arguments[8];
      const Select = arguments[9];
      const MenuItem = arguments[10];
      const SelectContent = ({ children }) => children;
      const SelectTrigger = ({ children }) => children;
      const SelectValue = () => null;
      const SelectItem = MenuItem;
      const Checkbox = arguments[11];
      const Switch = arguments[12];
      const Chip = arguments[13];
      const Badge = Chip;
      const Tabs = arguments[14];
      const Tab = arguments[15];
      const TabPanel = arguments[16];
      const TabsContent = TabPanel;
      const TabsList = ({ children }) => children;
      const TabsTrigger = Tab;
      const Dialog = arguments[17];
      const DialogContent = arguments[18];
      const DialogHeader = arguments[19];
      const DialogTitle = arguments[20];
      const DialogActions = arguments[21];
      const DialogFooter = DialogActions;
      const DialogDescription = ({ children }) => React.createElement('p', null, children);
      const DialogTrigger = ({ children }) => children;
      const Separator = arguments[22];
      const Divider = Separator;
      const Progress = arguments[23];
      const Slider = arguments[24];
      const Avatar = arguments[25];
      const AvatarFallback = ({ children }) => children;
      const AvatarImage = () => null;
      const Accordion = arguments[26];
      const AccordionSummary = arguments[27];
      const AccordionDetails = arguments[28];
      const AccordionContent = AccordionDetails;
      const AccordionItem = ({ children }) => children;
      const AccordionTrigger = AccordionSummary;
      const toast = arguments[29];
      const PhosphorIcons = arguments[30];
      const { Plus, Minus, ArrowCounterClockwise, PaperPlaneRight, Trash, User, Gear, Bell, MagnifyingGlass } = PhosphorIcons;

      ${transformedCode}

      ${returnStmt}
    })
  `
}
