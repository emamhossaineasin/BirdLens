import React from 'react';
import {Button, Modal, StyleSheet, Text, View} from 'react-native';

type UploadModalProps = {
  isModalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  pickImage: () => Promise<void>;
  takePicture: () => Promise<void>;
};

export default function UploadModal({
  isModalVisible,
  setModalVisible,
  pickImage,
  takePicture,
}: UploadModalProps): React.JSX.Element {
  return (
    <Modal
      visible={isModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Upload Image</Text>

          <View style={styles.modalButtons}>
            <Button title="Choose Image" onPress={pickImage} color="black" />
            <Button title="Take Photo" onPress={takePicture} color="green" />
            <Button
              title="Cancel"
              onPress={() => setModalVisible(false)}
              color="red"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});