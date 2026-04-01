import { Card, Statistic } from 'antd';
import type { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon?: ReactNode;
  color?: string;
  prefix?: string;
}

export function StatsCard({ title, value, icon, color = '#1677ff', prefix }: StatsCardProps) {
  return (
    <Card>
      <Statistic
        title={title}
        value={value}
        prefix={prefix || icon}
        valueStyle={{ color }}
      />
    </Card>
  );
}
