import { Input } from 'antd';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  value?: string;
  onChange?: (value: string) => void;
}

export function SearchBar({ placeholder = 'Search...', onSearch, value, onChange }: SearchBarProps) {
  return (
    <Input.Search
      placeholder={placeholder}
      onSearch={onSearch}
      value={value}
      onChange={e => onChange?.(e.target.value)}
      allowClear
      style={{ maxWidth: 300 }}
    />
  );
}
