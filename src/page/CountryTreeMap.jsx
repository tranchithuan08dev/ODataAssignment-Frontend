import React, { useState, useEffect } from 'react';
import { Treemap, Tooltip, ResponsiveContainer } from 'recharts';

const types = ['Confirmed', 'Active', 'Recovered', 'Deaths', 'Daily Increase'];

const CountryTreeMap = () => {
  const [activeType, setActiveType] = useState('Confirmed');
  const [mapData, setMapData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData(activeType);
  }, [activeType]);

  const fetchData = async (type) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://localhost:7114/api/Covid/treemap?type=${type.toLowerCase()}`
      );
      if (!response.ok) throw new Error('Failed to fetch data from API');
      const data = await response.json();
      setMapData(data.data);
    } catch (err) {
      setError(`Lỗi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Chuẩn hóa dữ liệu cho recharts Treemap
  const treemapData = mapData.map((d) => ({
    name: d.country,
    size: d.cases,
    percent: d.percent,
  }));

  // Tạo màu cho từng node
  const COLORS = [
    "#6C8AE4", "#E44C4C", "#F2C94C", "#27AE60", "#56CCF2", "#BB6BD9",
    "#FFB347", "#FF6961", "#77DD77", "#AEC6CF", "#CFCFC4", "#B39EB5"
  ];

  // Custom node content giống hình mẫu
  const CustomizedContent = (props) => {
    const { depth, x, y, width, height, index, name, size, percent } = props;
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: COLORS[index % COLORS.length],
            stroke: "#fff",
            strokeWidth: 2,
          }}
        />
        {width > 60 && height > 40 && (
          <text
            x={x + 8}
            y={y + 24}
            fontSize={14}
            fill="#fff"
            fontWeight="bold"
          >
            {name}
          </text>
        )}
        {width > 60 && height > 40 && (
          <text
            x={x + 8}
            y={y + 44}
            fontSize={13}
            fill="#fff"
          >
            {size?.toLocaleString()}
          </text>
        )}
        {width > 60 && height > 60 && percent && (
          <text
            x={x + 8}
            y={y + 64}
            fontSize={13}
            fill="#fff"
          >
            {percent}%
          </text>
        )}
      </g>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Treemap of Countries</h2>
        <div>
          The Treemap shows the number of Cases in Different countries<br />
          and their percent of total cases worldwide
        </div>
      </div>
      <div style={styles.content}>
        <div style={styles.treemapBox}>
          {loading && <div style={styles.stateText}>Đang tải dữ liệu...</div>}
          {error && <div style={styles.stateText}>{error}</div>}
          {!loading && !error && (
            <ResponsiveContainer width={900} height={400}>
              <Treemap
                width={900}
                height={400}
                data={treemapData}
                dataKey="size"
                aspectRatio={4 / 3}
                stroke="#fff"
                content={<CustomizedContent />}
              >
                <Tooltip
                  content={({ payload }) => {
                    if (!payload || !payload[0]) return null;
                    const node = payload[0].payload;
                    return (
                      <div style={{
                        background: "#fff",
                        border: "1px solid #2196f3",
                        padding: "8px",
                        borderRadius: "8px",
                        color: "#333",
                        fontWeight: "bold"
                      }}>
                        {node.name}<br />
                        {node.size?.toLocaleString()}<br />
                        {node.percent ? `${node.percent}%` : ""}
                      </div>
                    );
                  }}
                />
              </Treemap>
            </ResponsiveContainer>
          )}
        </div>
        <div style={styles.tabsBox}>
          {types.map((type) => (
            <button
              key={type}
              style={activeType === type
                ? { ...styles.tabButton, ...styles.tabButtonActive }
                : styles.tabButton}
              onClick={() => setActiveType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: '#f7fffa',
    borderRadius: '24px',
    padding: '32px',
    maxWidth: '1200px',
    margin: '40px auto',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    fontFamily: 'Segoe UI, Arial, sans-serif',
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px',
    color: '#2d3a4a',
  },
  content: {
    display: 'flex',
    flexDirection: 'row',
    gap: '32px',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  treemapBox: {
    flex: 1,
    background: '#f8fffa',
    borderRadius: '16px',
    padding: '16px',
    minWidth: '900px',
    minHeight: '400px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    alignItems: 'flex-start',
    marginLeft: '24px',
    marginTop: '24px',
  },
  tabButton: {
    background: '#fff',
    color: '#2196f3',
    border: '2px solid #2196f3',
    borderRadius: '8px',
    padding: '12px 24px',
    fontWeight: 'bold',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    outline: 'none',
  },
  tabButtonActive: {
    background: '#2196f3',
    color: '#fff',
    borderColor: '#2196f3',
    boxShadow: '0 2px 8px rgba(33,150,243,0.15)',
  },
  stateText: {
    fontSize: '1.2rem',
    color: '#666',
  },
};

export default CountryTreeMap;