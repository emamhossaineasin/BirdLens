import { Entypo } from '@react-native-vector-icons/entypo';
import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import React from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type ListRenderItem
} from 'react-native';

import type { PostComment } from '../types/models';

type CommentModalProps = {
  visible: boolean;
  comments: PostComment[];
  userComment: string;
  submitting: boolean;
  onCommentChange: (comment: string) => void;
  onSubmit: () => Promise<void>;
  onClose: () => void;
};

export default function CommentModal({
  visible,
  comments,
  userComment,
  submitting,
  onCommentChange,
  onSubmit,
  onClose,
}: CommentModalProps): React.JSX.Element {
  const renderComment: ListRenderItem<PostComment> = ({item}) => (
    <View style={styles.commentRow}>
      {item.image ? (
        <Image source={{uri: item.image}} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder} />
      )}

      <View style={styles.commentContent}>
        <Text style={styles.userName}>{item.userName}</Text>
        <Text style={styles.commentText}>{item.comment}</Text>
      </View>
    </View>
  );

  return (
    // <Modal
    //   visible={visible}
    //   transparent
    //   animationType="slide"
    //   onRequestClose={onClose}>
    //   <View style={styles.overlay}>
    //     <View style={styles.modalContent}>
    //       <View style={styles.header}>
    //         <Text style={styles.title}>Comments</Text>

    //         <TouchableOpacity style={styles.closeButton} onPress={onClose}>
    //           <Entypo name="cross" size={24} color="black" />
    //         </TouchableOpacity>
    //       </View>

    //       <FlatList
    //         data={comments}
    //         renderItem={renderComment}
    //         keyExtractor={item => item.id}
    //         style={styles.list}
    //         contentContainerStyle={
    //           comments.length === 0 ? styles.emptyList : undefined
    //         }
    //         ListEmptyComponent={
    //           <Text style={styles.emptyText}>No comments yet.</Text>
    //         }
    //       />

    //       <View style={styles.inputRow}>
    //         <TextInput
    //           style={styles.input}
    //           placeholder="Write a comment"
    //           value={userComment}
    //           onChangeText={onCommentChange}
    //           multiline
    //         />

    //         <TouchableOpacity
    //           style={styles.sendButton}
    //           disabled={submitting || !userComment.trim()}
    //           onPress={() => {
    //             void onSubmit();
    //           }}>
    //           <FontAwesome
    //             name="send"
    //             size={24}
    //             color={
    //               submitting || !userComment.trim()
    //                 ? 'gray'
    //                 : 'black'
    //             }
    //           />
    //         </TouchableOpacity>
    //       </View>
    //     </View>
    //   </View>
    // </Modal>
    //<View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Comments</Text>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Entypo name="cross" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={comments}
            renderItem={renderComment}
            keyExtractor={item => item.id}
            style={styles.list}
            nestedScrollEnabled={true}
            scrollEnabled={true}
            ListEmptyComponent={
            <Text style={styles.emptyText}>No comments yet.</Text>
            }
          />

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Write a comment"
              value={userComment}
              onChangeText={onCommentChange}
              multiline
            />

            <TouchableOpacity
              style={styles.sendButton}
              disabled={submitting || !userComment.trim()}
              onPress={() => {
                void onSubmit();
              }}>
              <FontAwesome
                name="send"
                size={24}
                color={
                  submitting || !userComment.trim()
                    ? 'gray'
                    : 'black'
                }
              />
            </TouchableOpacity>
          </View>
        </View>
      //</View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    borderTopColor: '#ddd',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    paddingTop: 8,
  },
  title: {
    flex: 1,
    fontSize: 25,
    fontWeight: 'bold',
    //textAlign: 'center',
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 17,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  list: {
    //height: 200,
    flex: 1,
    marginVertical: 8,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyText: {
    color: 'gray',
    textAlign: 'center',
  },
  commentRow: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  avatar: {
    borderRadius: 25,
    height: 50,
    width: 50,
  },
  avatarPlaceholder: {
    backgroundColor: '#ddd',
    borderRadius: 25,
    height: 50,
    width: 50,
  },
  commentContent: {
    flex: 1,
    paddingLeft: 8,
  },
  userName: {
    fontWeight: 'bold',
  },
  commentText: {
    alignSelf: 'flex-start',
    backgroundColor: 'lightgray',
    borderRadius: 15,
    fontSize: 17,
    marginTop: 3,
    padding: 8,
  },
  inputRow: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingTop: 8,
  },
  input: {
    backgroundColor: 'lightgray',
    borderRadius: 15,
    flex: 1,
    fontSize: 18,
    maxHeight: 100,
    minHeight: 50,
    paddingHorizontal: 10,
  },
  sendButton: {
  alignItems: 'center',
  backgroundColor: 'rgba(0,0,0,0.1)',
  borderRadius: 25,
  height: 50,
  justifyContent: 'center',
  marginLeft: 8,
  width: 50,
},
});