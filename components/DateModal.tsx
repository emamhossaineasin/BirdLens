import React from 'react';
import {Modal, Platform, StyleSheet, View} from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

type DateModalProps = {
  visible: boolean;
  value: Date;
  maximumDate: Date;
  onChange: (date: Date) => void;
  onClose: () => void;
};

export default function DateModal({
  visible,
  value,
  maximumDate,
  onChange,
  onClose,
}: DateModalProps): React.JSX.Element | null {
  if (!visible) {
    return null;
  }

  const handleChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ): void => {
    if (Platform.OS === 'android') {
      onClose();
    }

    if (event.type === 'set' && selectedDate) {
      onChange(selectedDate);
    }
  };

  if (Platform.OS === 'android') {
    return (
      <DateTimePicker
        mode="date"
        value={value}
        maximumDate={maximumDate}
        onChange={handleChange}
      />
    );
  }

  return (
    <Modal visible transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <DateTimePicker
            display="spinner"
            mode="date"
            value={value}
            maximumDate={maximumDate}
            onChange={handleChange}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    width: '90%',
  },
});