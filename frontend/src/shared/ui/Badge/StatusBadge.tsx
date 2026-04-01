import { Tag } from 'antd';
import { STATUS_COLORS } from '../../../utils/constants';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const color = STATUS_COLORS[status] || 'default';
  return <Tag color={color}>{status.replace(/_/g, ' ').toUpperCase()}</Tag>;
}
