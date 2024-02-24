import { StyleSheet, Text, View, Modal, TextInput, Button } from 'react-native'
import React from 'react'

const UploadModal = (props) => {
    return (
        <Modal
            visible={props.isModalVisible}
            transparent={true}
            animationType="slide"
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Upload Image</Text>
                    <View style={styles.modalButtons}>
                        <Button title="Choose Image" onPress={props.pickImage} color={'black'} />
                        <Button title="Take Photo" onPress={props.takePicture} color={'green'} />
                        <Button title="cancel" onPress={() => {props.setModalVisible(false)}} color={'red'} />
                    </View>
                </View>
            </View>
        </Modal>
    )
}


export default UploadModal

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
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
})