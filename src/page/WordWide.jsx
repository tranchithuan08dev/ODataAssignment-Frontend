import React, { useState, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import { scaleQuantile } from 'd3-scale';

const geoUrl =
  'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const WordWide = () => {
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
      // Sửa lại đường dẫn API nếu cần thiết
      const response = await fetch(
        `https://localhost:7114/api/Covid/treemap?type=${type.toLowerCase()}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch data from API');
      }
      const data = await response.json();
      setMapData(data.data);
    } catch (err) {
      setError(`Lỗi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const colorScale = scaleQuantile()
    .domain(mapData.map((d) => d.cases))
    .range([
      '#e6f0f8',
      '#b3d3ed',
      '#66a3d9',
      '#3385cc',
      '#0066b3',
      '#004c80',
    ]);

  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.tabNavigation}>
        <h2 style={styles.dashboardTitle}># of Cases Worldwide</h2>
        <div style={styles.tabs}>
          {['Confirmed', 'Active', 'Recovered', 'Deaths', 'Daily Increase'].map(
            (type) => (
              <button
                key={type}
                style={
                  activeType === type
                    ? { ...styles.tabButton, ...styles.tabButtonActive }
                    : styles.tabButton
                }
                onClick={() => setActiveType(type)}
              >
                {type}
              </button>
            )
          )}
        </div>
      </div>
      <div style={styles.mapContainer}>
        {loading && <div style={styles.stateText}>Đang tải dữ liệu...</div>}
        {error && <div style={styles.stateText}>{error}</div>}
        {!loading && !error && (
          <ComposableMap
            projectionConfig={{
              rotate: [-10, 0, 0],
              scale: 147,
            }}
          >
            <ZoomableGroup>
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const countryData = mapData.find(
                      (d) => d.country === geo.properties.name
                    );
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={countryData ? colorScale(countryData.cases) : '#EEE'}
                        stroke="#FFF"
                        strokeWidth={0.5}
                        style={{
                          default: { outline: 'none' },
                          hover: { outline: 'none' },
                          pressed: { outline: 'none' },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        )}
      </div>
    </div>
  );
};

const styles = {
  dashboardContainer: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    padding: '20px',
    backgroundColor: '#f5f6f7',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100vw',
    height: '100vh',
  },
  tabNavigation: {
    backgroundColor: '#fff',
    padding: '15px 20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px',
    width: '100%',
    maxWidth: '800px',
    textAlign: 'center',
  },
  dashboardTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#333',
    marginBottom: '15px',
  },
  tabs: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
  },
  tabButton: {
    backgroundColor: '#f0f2f5',
    color: '#555',
    border: '1px solid #ddd',
    padding: '10px 20px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s ease-in-out',
  },
  tabButtonActive: {
    backgroundColor: '#2196f3',
    color: '#fff',
    borderColor: '#2196f3',
    boxShadow: '0 2px 4px rgba(33, 150, 243, 0.25)',
  },
  mapContainer: {
    width: '100%',
    maxWidth: '1000px',
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    minHeight: '500px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateText: {
    fontSize: '1.2rem',
    color: '#666',
  },
};

export default WordWide;