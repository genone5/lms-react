import { Modal } from 'antd';
import type { ReactNode } from 'react';

interface FormModalProps {
  open: boolean;
  title: string;
  onCancel: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}

export function FormModal({ open, title, onCancel, children, footer, width = 600 }: FormModalProps) {
  return (
    <Modal open={open} title={title} onCancel={onCancel} footer={footer} width={width} destroyOnClose>
      {children}
    </Modal>
  );
}
