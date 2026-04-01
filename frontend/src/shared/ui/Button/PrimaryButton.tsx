import { Button } from 'antd';
import type { ButtonProps } from 'antd';

export function PrimaryButton(props: ButtonProps) {
  return <Button type="primary" {...props} />;
}
