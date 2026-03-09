import React from 'react';

// Comprehensive FakeMUI mock for testing
export const Box = ({ children, 'data-testid': testId, sx, ...props }: any) => (
  <div data-testid={testId} style={sx} {...props}>{children}</div>
);

export const Typography = ({ children, 'data-testid': testId, variant, ...props }: any) => (
  <div data-testid={testId} data-variant={variant} {...props}>{children}</div>
);

export const Card = ({ children, 'data-testid': testId, sx, ...props }: any) => (
  <div data-testid={testId} style={sx} {...props}>{children}</div>
);

export const CardContent = ({ children, ...props }: any) => <div {...props}>{children}</div>;

export const CardHeader = ({ title, subheader, avatar, action, ...props }: any) => (
  <div {...props}>
    {avatar}
    <div>{title}</div>
    {subheader && <div>{subheader}</div>}
    {action}
  </div>
);

export const CardActions = ({ children, ...props }: any) => <div {...props}>{children}</div>;

export const Button = ({ children, onClick, 'data-testid': testId, variant, ...props }: any) => (
  <button data-testid={testId} onClick={onClick} data-variant={variant} {...props}>
    {children}
  </button>
);

export const TextField = ({ label, 'data-testid': testId, value, onChange, ...props }: any) => (
  <input
    data-testid={testId}
    placeholder={label}
    value={value}
    onChange={onChange}
    {...props}
  />
);

export const Select = ({ children, value, onChange, 'data-testid': testId, ...props }: any) => (
  <select data-testid={testId} value={value} onChange={onChange} {...props}>
    {children}
  </select>
);

export const MenuItem = ({ children, value, ...props }: any) => (
  <option value={value} {...props}>{children}</option>
);

export const Switch = ({ checked, onChange, 'data-testid': testId, ...props }: any) => (
  <input
    type="checkbox"
    data-testid={testId}
    checked={checked}
    onChange={onChange}
    {...props}
  />
);

export const FormControlLabel = ({ control, label, ...props }: any) => (
  <label {...props}>
    {control}
    <span>{label}</span>
  </label>
);

export const LinearProgress = ({ value, 'data-testid': testId, ...props }: any) => (
  <div data-testid={testId} data-value={value} role="progressbar" {...props} />
);

export const Chip = ({ label, 'data-testid': testId, ...props }: any) => (
  <span data-testid={testId} {...props}>{label}</span>
);

export const Grid = ({ children, 'data-testid': testId, container, item, xs, sm, md, lg, ...props }: any) => (
  <div
    data-testid={testId}
    data-container={container}
    data-item={item}
    data-xs={xs}
    data-sm={sm}
    data-md={md}
    data-lg={lg}
    {...props}
  >
    {children}
  </div>
);

export const Avatar = ({ children, src, alt, 'data-testid': testId, ...props }: any) => (
  <div data-testid={testId} data-src={src} data-alt={alt} {...props}>
    {children || alt}
  </div>
);

export const Divider = ({ 'data-testid': testId, ...props }: any) => (
  <hr data-testid={testId} {...props} />
);

export const List = ({ children, 'data-testid': testId, ...props }: any) => (
  <ul data-testid={testId} {...props}>{children}</ul>
);

export const ListItem = ({ children, 'data-testid': testId, button, onClick, ...props }: any) => {
  const Element = button || onClick ? 'button' : 'li';
  return (
    <Element data-testid={testId} onClick={onClick} {...props}>
      {children}
    </Element>
  );
};

export const ListItemAvatar = ({ children, ...props }: any) => <div {...props}>{children}</div>;

export const ListItemText = ({ primary, secondary, ...props }: any) => (
  <div {...props}>
    <div>{primary}</div>
    {secondary && <div>{secondary}</div>}
  </div>
);

export const Tabs = ({ children, 'data-testid': testId, value, onChange, ...props }: any) => (
  <div
    data-testid={testId}
    data-value={value}
    onClick={() => onChange && onChange({}, 0)}
    role="tablist"
    {...props}
  >
    {children}
  </div>
);

export const Tab = ({ label, 'data-testid': testId, ...props }: any) => (
  <button data-testid={testId} role="tab" {...props}>{label}</button>
);

export const Dialog = ({ children, open, 'data-testid': testId, ...props }: any) => (
  open ? <div data-testid={testId} role="dialog" {...props}>{children}</div> : null
);

export const DialogTitle = ({ children, ...props }: any) => <div {...props}>{children}</div>;

export const DialogContent = ({ children, ...props }: any) => <div {...props}>{children}</div>;

export const DialogActions = ({ children, ...props }: any) => <div {...props}>{children}</div>;

export const Alert = ({ children, severity, onClose, 'data-testid': testId, ...props }: any) => (
  <div data-testid={testId} data-severity={severity} role="alert" {...props}>
    {children}
    {onClose && <button onClick={onClose}>Close</button>}
  </div>
);

export const Accordion = ({ children, 'data-testid': testId, expanded, onChange, ...props }: any) => (
  <div data-testid={testId} data-expanded={expanded} onClick={() => onChange && onChange()} {...props}>
    {children}
  </div>
);

export const AccordionSummary = ({ children, ...props }: any) => <div {...props}>{children}</div>;

export const AccordionDetails = ({ children, ...props }: any) => <div {...props}>{children}</div>;

export const Breadcrumbs = ({ children, 'data-testid': testId, ...props }: any) => (
  <nav data-testid={testId} {...props}>{children}</nav>
);

export const Link = ({ children, href, 'data-testid': testId, ...props }: any) => (
  <a data-testid={testId} href={href} {...props}>{children}</a>
);

export const Paper = ({ children, 'data-testid': testId, elevation, ...props }: any) => (
  <div data-testid={testId} data-elevation={elevation} {...props}>{children}</div>
);

export const Stack = ({ children, 'data-testid': testId, direction, spacing, ...props }: any) => (
  <div data-testid={testId} data-direction={direction} data-spacing={spacing} {...props}>
    {children}
  </div>
);

export const Badge = ({ children, badgeContent, 'data-testid': testId, ...props }: any) => (
  <div data-testid={testId} {...props}>
    {children}
    {badgeContent && <span>{badgeContent}</span>}
  </div>
);

export const Tooltip = ({ children, title, ...props }: any) => (
  <div title={title} {...props}>{children}</div>
);

export const IconButton = ({ children, onClick, 'data-testid': testId, ...props }: any) => (
  <button data-testid={testId} onClick={onClick} {...props}>{children}</button>
);

export const Menu = ({ children, anchorEl, open, onClose, 'data-testid': testId, ...props }: any) => (
  open ? <div data-testid={testId} {...props}>{children}</div> : null
);

export const Snackbar = ({ open, message, onClose, 'data-testid': testId, ...props }: any) => (
  open ? (
    <div data-testid={testId} {...props}>
      {message}
      {onClose && <button onClick={onClose}>Close</button>}
    </div>
  ) : null
);

export const Checkbox = ({ checked, onChange, 'data-testid': testId, ...props }: any) => (
  <input
    type="checkbox"
    data-testid={testId}
    checked={checked}
    onChange={onChange}
    {...props}
  />
);

export const Radio = ({ checked, onChange, 'data-testid': testId, value, ...props }: any) => (
  <input
    type="radio"
    data-testid={testId}
    checked={checked}
    onChange={onChange}
    value={value}
    {...props}
  />
);

export const RadioGroup = ({ children, value, onChange, ...props }: any) => (
  <div data-value={value} {...props}>{children}</div>
);

export const FormControl = ({ children, ...props }: any) => <div {...props}>{children}</div>;

export const FormLabel = ({ children, ...props }: any) => <label {...props}>{children}</label>;

export const InputLabel = ({ children, ...props }: any) => <label {...props}>{children}</label>;

export const Table = ({ children, 'data-testid': testId, ...props }: any) => (
  <table data-testid={testId} {...props}>{children}</table>
);

export const TableHead = ({ children, ...props }: any) => <thead {...props}>{children}</thead>;

export const TableBody = ({ children, ...props }: any) => <tbody {...props}>{children}</tbody>;

export const TableRow = ({ children, 'data-testid': testId, ...props }: any) => (
  <tr data-testid={testId} {...props}>{children}</tr>
);

export const TableCell = ({ children, ...props }: any) => <td {...props}>{children}</td>;
