import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme';

const Dropdown = ({ label, value, options, onSelect, labelMap }) => {
  const [showPicker, setShowPicker] = useState(false);
  const getLabel = (option) => labelMap?.[option] || option.replace('_', ' ');

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowPicker(!showPicker)}
      >
        <Text style={styles.buttonText}>{getLabel(value)}</Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      {showPicker && (
        <View style={styles.dropdown}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={styles.option}
              onPress={() => {
                onSelect(opt);
                setShowPicker(false);
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  value === opt && styles.optionTextSelected,
                ]}
              >
                {getLabel(opt)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    zIndex: 100, // Make sure dropdown appears over other elements
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.surface,
  },
  buttonText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  arrow: {
    fontSize: 10,
    color: colors.textMuted,
  },
  dropdown: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    shadowColor: '#1d1d1b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 999,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceAlt,
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
  },
  optionTextSelected: {
    fontWeight: 'bold',
    color: colors.primary,
  },
});

export default Dropdown;
