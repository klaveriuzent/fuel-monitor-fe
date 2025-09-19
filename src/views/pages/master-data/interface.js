/* eslint-disable prettier/prettier */
import { Button } from 'antd'

export const siteColumns = [
  {
    title: 'Group',
    dataIndex: 'group',
    key: 'group',
    width: 80,
  },
  {
    title: 'BACode',
    dataIndex: 'bacode',
    key: 'bacode',
    width: 80,
  },
  {
    title: 'Site Info',
    dataIndex: 'idSite',
    key: 'siteInfo',
    render: (_, record) => (
      <div style={{ lineHeight: 1.4 }}>
        {/* Status tag di atas */}
        <div
          style={{
            display: 'inline-block',
            backgroundColor: record.active ? '#9eff91' : '#ff9e9e',
            borderRadius: 4,
            padding: '2px 6px',
            fontSize: '10px',
            fontWeight: 'bold',
            marginBottom: 6,
          }}
        >
          Status: {record.active ? 'Active' : 'Offline'}
        </div>

        {/* ID SITE dan value sejajar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: 4 }}>
          <div
            style={{
              display: 'inline-block',
              backgroundColor: '#f0f0f0',
              borderRadius: 4,
              padding: '2px 6px',
              fontSize: '10px',
              fontWeight: 'bold',
            }}
          >
            ID SITE
          </div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            {record.idSite}
          </div>
        </div>

        {/* Area */}
        <div
          style={{
            fontSize: '12px',
            marginTop: 2,
          }}
        >
          {record.area}
        </div>

        {/* Coordinates */}
        <div
          style={{
            fontSize: '11px',
            fontStyle: 'italic',
            marginTop: 2,
          }}
        >
          {record.coordinates}
        </div>
      </div>
    ),
  },
  // {
  //   title: 'Action',
  //   key: 'action',
  //   width: 120,
  //   render: (_, record) => (
  //     <Button type={record.active ? 'primary' : 'default'}>
  //       {record.active ? 'Aktif' : 'Non Aktif'}
  //     </Button>
  //   ),
  // },
]
