import {StyleSheet, Text, View, Modal, KeyboardAvoidingView,TouchableOpacity,} from 'react-native'
import React from 'react'
import DatePicker from "react-native-modern-datepicker";

const DateModal = (props) => {

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={props.openStartDatePicker}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <DatePicker
                        mode="calendar"
                        maximumDate={props.startDate}
                        selected={props.startedDate}
                        onDateChanged={props.handleChangeStartDate}
                        onSelectedChange={(date) => { props.setSelectedStartDate(date) }}
                        options={{
                            backgroundColor: "#080516",
                            textHeaderColor: "#469ab6",
                            textDefaultColor: "#FFFFFF",
                            selectedTextColor: "#FFF",
                            mainColor: "#469ab6",
                            textSecondaryColor: "#FFFFFF",
                            borderColor: "rgba(122, 146, 165, 0.1)",
                        }}
                    />

                    <TouchableOpacity onPress={props.handleOnPressStartDate}>
                        <Text style={{ color: "white" }}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}

export default DateModal

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    modalView: {
        margin: 20,
        backgroundColor: "#080516",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 20,
        padding: 20,
        width: "90%",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
})