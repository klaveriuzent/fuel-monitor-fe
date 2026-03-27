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
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: 6 }}>
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

        {/* Card Container */}
        <div
          style={{
            background: 'linear-gradient(135deg, #fafafa, #f0f0f0)',
            border: '1px solid #e0e0e0',
            borderRadius: 8,
            padding: '10px 12px',
            marginBottom: 8,
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}
        >
          {/* Header Card */}
          <div
            style={{
              fontSize: '11px',
              fontWeight: 'bold',
              color: '#666',
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Tank Information
          </div>

          {/* Status */}
          <div
            style={{
              display: 'inline-block',
              backgroundColor: record.active ? '#9eff91' : '#ff9e9e',
              borderRadius: 4,
              padding: '3px 8px',
              fontSize: '11px',
              fontWeight: 'bold',
              marginBottom: 8,
            }}
          >
            Status: {record.active ? 'Active' : 'Offline'}
          </div>

          {/* Grade & Type */}
          <div
            style={{
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: 10,
              color: '#333',
            }}
          >
            {record.grade} | {record.type}
          </div>

          {/* Grid ID & Tank ID */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
            }}
          >
            {/* ID */}
            <div
              style={{
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: 6,
                padding: '6px',
              }}
            >
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: '#666',
                  marginBottom: 2,
                }}
              >
                ID
              </div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#333' }}>
                {record.id}
              </div>
            </div>

            {/* Tank ID */}
            <div
              style={{
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: 6,
                padding: '6px',
              }}
            >
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: '#666',
                  marginBottom: 2,
                }}
              >
                Tank ID
              </div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#111' }}>
                {record.idTank}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
]