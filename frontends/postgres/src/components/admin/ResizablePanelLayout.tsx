import s from './resizable-panel-layout.module.scss';

type Props = {
  panel: React.ReactNode;
  panelWidth: number;
  onHandleMouseDown: (e: React.MouseEvent) => void;
  children: React.ReactNode;
};

export default function ResizablePanelLayout(
  { panel, panelWidth, onHandleMouseDown, children }: Props,
) {
  return (
    <div className={s.stack}>
      <div className={s.panel}
        style={{ '--panel-width': `${panelWidth ?? 240}px` } as React.CSSProperties}>
        {panel}
      </div>
      <div className={s.handle} onMouseDown={onHandleMouseDown} />
      <div className={s.content}>
        {children}
      </div>
    </div>
  );
}
