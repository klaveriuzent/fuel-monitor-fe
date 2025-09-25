/* eslint-disable prettier/prettier */

export const siteColumns = [
  {
    title: 'Action',
    key: 'action',
    width: 80,
    // render override nanti di MasterSites
  },
  {
    title: 'Site Info',
    dataIndex: 'idSite',
    key: 'siteInfo',
    render: (_, record) => (
      <div style={{ lineHeight: 1.4 }}>
        {/* Status */}
        <div
          style={{
            display: 'inline-block',
            backgroundColor: record.active ? '#9eff91' : '#ff9e9e',
            borderRadius: 4,
            padding: '2px 6px',
            fontSize: '10px',
            fontWeight: 'bold',
            marginBottom: 8,
          }}
        >
          Status: {record.active ? 'Active' : 'Offline'}
        </div>

        {/* ID SITE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: 4 }}>
          <div
            style={{
              display: 'inline-block',
              backgroundColor: '#bbbbbbff',
              borderRadius: 4,
              padding: '2px 6px',
              fontSize: '10px',
              fontWeight: 'bold',
            }}
          >
            ID SITE
          </div>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{record.idSite}</div>
        </div>

        {/* BACode */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: 4 }}>
          <div
            style={{
              display: 'inline-block',
              backgroundColor: '#bbbbbbff',
              borderRadius: 4,
              padding: '2px 6px',
              fontSize: '10px',
              fontWeight: 'bold',
            }}
          >
            BACode
          </div>
          <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{record.bacode}</div>
        </div>

        {/* Area */}
        <div style={{ fontSize: '12px', marginTop: 8 }}>{record.area}</div>

        {/* Coordinates */}
        <div style={{ fontSize: '11px', fontStyle: 'italic', marginTop: 2 }}>{record.coordinates}</div>
      </div>
    ),
  },
]

/* eslint-disable prettier/prettier */
export const tankColumns = [
  {
    title: 'Action',
    key: 'action',
    width: 80,
    // render override nanti di MasterTanks
  },
  {
    title: 'Tank Info',
    dataIndex: 'idTank',
    key: 'tankInfo',
    render: (_, record) => (
      <div style={{ lineHeight: 1.4 }}>
        {/* Status */}
        <div
          style={{
            display: 'inline-block',
            backgroundColor: record.active ? '#9eff91' : '#ff9e9e',
            borderRadius: 4,
            padding: '2px 6px',
            fontSize: '10px',
            fontWeight: 'bold',
            marginBottom: 8,
          }}
        >
          Status: {record.active ? 'Active' : 'Offline'}
        </div>

        {/* idSite */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: 4 }}>
          <div
            style={{
              display: 'inline-block',
              backgroundColor: '#bbbbbbff',
              borderRadius: 4,
              padding: '2px 6px',
              fontSize: '10px',
              fontWeight: 'bold',
            }}
          >
            idSite
          </div>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{record.idSite}</div>
        </div>

        {/* BACode */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: 4 }}>
          <div
            style={{
              display: 'inline-block',
              backgroundColor: '#bbbbbbff',
              borderRadius: 4,
              padding: '2px 6px',
              fontSize: '10px',
              fontWeight: 'bold',
            }}
          >
            BACode
          </div>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{record.bacode || '-'}</div>
        </div>

        {/* ID */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: 4 }}>
          <div
            style={{
              display: 'inline-block',
              backgroundColor: '#bbbbbbff',
              borderRadius: 4,
              padding: '2px 6px',
              fontSize: '10px',
              fontWeight: 'bold',
            }}
          >
            ID
          </div>
          <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{record.id}</div>
        </div>

        {/* Tank ID */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: 4 }}>
          <div
            style={{
              display: 'inline-block',
              backgroundColor: '#bbbbbbff',
              borderRadius: 4,
              padding: '2px 6px',
              fontSize: '10px',
              fontWeight: 'bold',
            }}
          >
            Tank ID
          </div>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{record.idTank}</div>
        </div>

        {/* Type */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: 4 }}>
          <div style={{ fontSize: '12px' }}>{record.grade} | {record.type}</div>
        </div>
      </div>
    ),
  },
]