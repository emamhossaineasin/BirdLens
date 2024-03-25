import { StyleSheet, Text, View, Modal, TextInput, Button, TouchableOpacity, Image, FlatList } from 'react-native'
import React from 'react'
import { Entypo } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';

const CommentModal = (props) => {
    // console.log(props.comments)

    const renderComments = ({ item }) => {
        return (<View style={{ display: 'flex', flexDirection: 'row', margin : 5 }}>
            <Image source={{ uri: item.image }} style={{ width: 50, height: 50, borderRadius: 25, marginTop: 5 }} />
            <View style={{ display: 'flex', flexDirection: 'column', paddingLeft: 5 }}>
                <Text>{item.userName}</Text>
                <Text style={{ backgroundColor: 'lightgray', borderRadius: 15, padding: 5, width: 'auto', fontSize: 17 }}>{item.comment}</Text>
            </View>
        </View>)
    }

    return (
        <Modal
            visible={props.commentModal}
            transparent={true}
            animationType="slide"
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={{ display: 'flex', flexDirection: 'row', borderBottomColor: 'black', borderBottomWidth: 1, padding: 5, width: '100%' }}>
                        <View style={{ flex: 1, alignItems: 'center' }}>
                            <Text style={{ fontSize: 25, fontWeight: 'bold' }}>Comments</Text>
                        </View>
                        <View style={{ height: 30, width: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.1)' }}>
                            <TouchableOpacity onPress={() => { props.setCommentModal(false), props.setUserComment(''), props.setComments(null) }}>
                                <Entypo name="cross" size={24} color="black" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.flatListContainer}>
                        <FlatList
                            data={props.comments} // Adjust based on pageSize
                            renderItem={renderComments}
                            keyExtractor={(item) => item.id}
                            showsVerticalScrollIndicator={true}
                        />
                    </View>
                    <View style={{ display: 'flex', flexDirection: 'row', borderTopColor: 'black', borderTopWidth: 1, padding: 5, width: '100%' }}>
                        <View style={{ flex: 1, alignItems: 'center' }}>
                            <TextInput
                                style={styles.comment}
                                placeholder="Write a comment"
                                cursorColor={'black'}
                                value={props.userComment}
                                onChangeText={(text) => { props.setUserComment(text) }}
                            />
                        </View>
                        <View style={{ height: 50, width: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.1)' }}>
                            <TouchableOpacity onPress={() => props.storeComments()}>
                                <FontAwesome name="send" size={25} color="black" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

export default CommentModal

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 10,
        width: '95%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    comment: {
        height: 50,
        borderRadius: 15,
        width: '100%',
        backgroundColor: 'lightgray',
        paddingLeft: 5,
        fontSize: 18
    },
    flatListContainer: {
        width: '100%',
        height: 300,
        padding: 10
    }
})