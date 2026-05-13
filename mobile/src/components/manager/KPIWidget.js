import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import Card from '../common/Card';

const KPIWidget = ({ label, value, unit = '', trend, icon }) => {
  const trendColor = trend > 0 ? '#34C759' : trend < 0 ? '#FF3B30' : '#999';
  const trendSymbol = trend > 0 ? '↑' : trend < 0 ? '↓' : '→';

  return (
    <Card style={styles.card} elevated>
      <View style={styles.header}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text style={styles.label}>{label}</Text>
      </View>

      <View style={styles.valueContainer}>
        <Text style={styles.value}>
          {value}
          {unit && <Text style={styles.unit}>{unit}</Text>}
        </Text>
        {trend !== undefined && (
          <Text style={[styles.trend, { color: trendColor }]}>
            {trendSymbol} {Math.abs(trend)}%
          </Text>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 8,
    minWidth: 150,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 24,
    marginRight: 8,
  },
  label: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  valueContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  unit: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  trend: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
});

KPIWidget.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  unit: PropTypes.string,
  trend: PropTypes.number,
  icon: PropTypes.string,
};

export default KPIWidget;
