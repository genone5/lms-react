import { Button, Tooltip, Popover, Space, Typography, Divider } from 'antd';
import { BulbOutlined, BulbFilled, CheckOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../app/store';
import { toggleMode, setColor } from '../../../store/slices/themeSlice';
import type { ThemeColor } from '../../../store/slices/themeSlice';
import { COLOR_PRESETS } from '../../../utils/themeConfig';

const { Text } = Typography;

export function ThemeSwitcher() {
  const dispatch = useDispatch<AppDispatch>();
  const { mode, color } = useSelector((state: RootState) => state.theme);

  const content = (
    <div style={{ width: 200 }}>
      <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        Mode
      </Text>
      <div style={{ marginTop: 8, marginBottom: 12 }}>
        <Space>
          <Button
            size="small"
            type={mode === 'light' ? 'primary' : 'default'}
            onClick={() => dispatch(toggleMode())}
            icon={<BulbOutlined />}
          >
            Light
          </Button>
          <Button
            size="small"
            type={mode === 'dark' ? 'primary' : 'default'}
            onClick={() => dispatch(toggleMode())}
            icon={<BulbFilled />}
          >
            Dark
          </Button>
        </Space>
      </div>

      <Divider style={{ margin: '8px 0' }} />

      <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        Color
      </Text>
      <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {(Object.entries(COLOR_PRESETS) as [ThemeColor, { primary: string; label: string }][]).map(([key, val]) => (
          <Tooltip key={key} title={val.label} placement="bottom">
            <div
              onClick={() => dispatch(setColor(key))}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: val.primary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: color === key ? '2px solid #fff' : '2px solid transparent',
                boxShadow: color === key ? `0 0 0 2px ${val.primary}` : 'none',
                transition: 'all 0.2s',
              }}
            >
              {color === key && <CheckOutlined style={{ color: '#fff', fontSize: 12 }} />}
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  );

  return (
    <Popover content={content} title="Theme" trigger="click" placement="bottomRight">
      <Tooltip title="Change Theme">
        <Button
          type="text"
          size="large"
          icon={mode === 'dark' ? <BulbFilled /> : <BulbOutlined />}
        />
      </Tooltip>
    </Popover>
  );
}
