import {
  getAuth,
  onAuthStateChanged,
} from '@react-native-firebase/auth';
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  increment,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from '@react-native-firebase/firestore';
import { Feather } from '@react-native-vector-icons/feather';
import { FontAwesome5 } from '@react-native-vector-icons/fontawesome5';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ListRenderItem,
} from 'react-native';

import CommentModal from '../components/CommentModal';
import Loader from '../components/Loader';
import Pagination from '../components/Pagination';
import { db } from '../services/firebase';
import type {
  Post,
  PostComment,
  UserProfile,
} from '../types/models';
import type { HomeScreenProps } from '../types/navigation';

const PAGE_SIZE = 5;

type UnknownPostDocument = {
  post_id?: unknown;
  message?: unknown;
  author_name?: unknown;
  author_id?: unknown;
  author_image?: unknown;
  image?: unknown;
  likeCount?: unknown;
  commentCount?: unknown;
  likes?: unknown;
  timestamp?: unknown;
};

type UnknownCommentDocument = {
  comment?: unknown;
  userName?: unknown;
  image?: unknown;
  createdAt?: unknown;
};

type FirestoreTimestamp = NonNullable<Post['timestamp']>;

function isFirestoreTimestamp(
  value: unknown,
): value is FirestoreTimestamp {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const possibleTimestamp = value as {
    toDate?: unknown;
    toMillis?: unknown;
  };

  return (
    typeof possibleTimestamp.toDate === 'function' &&
    typeof possibleTimestamp.toMillis === 'function'
  );
}

function mapPost(
  documentId: string,
  source: UnknownPostDocument,
): Post {
  return {
    id: documentId,

    post_id:
      typeof source.post_id === 'string' &&
      source.post_id.trim()
        ? source.post_id
        : documentId,

    message:
      typeof source.message === 'string'
        ? source.message
        : '',

    author_name:
      typeof source.author_name === 'string' &&
      source.author_name.trim()
        ? source.author_name
        : 'Unknown user',

    author_id:
      typeof source.author_id === 'string'
        ? source.author_id
        : '',

    author_image:
      typeof source.author_image === 'string'
        ? source.author_image
        : '',

    image:
      typeof source.image === 'string'
        ? source.image
        : '',

    likeCount:
      typeof source.likeCount === 'number' &&
      Number.isFinite(source.likeCount)
        ? Math.max(0, source.likeCount)
        : 0,

    commentCount:
      typeof source.commentCount === 'number' &&
      Number.isFinite(source.commentCount)
        ? Math.max(0, source.commentCount)
        : 0,

    likes: Array.isArray(source.likes)
      ? source.likes.filter(
          (item): item is string =>
            typeof item === 'string',
        )
      : [],

    timestamp: isFirestoreTimestamp(source.timestamp)
      ? source.timestamp
      : null,
  };
}

function mapComment(
  documentId: string,
  source: UnknownCommentDocument,
): PostComment {
  return {
    id: documentId,

    comment:
      typeof source.comment === 'string'
        ? source.comment
        : '',

    userName:
      typeof source.userName === 'string' &&
      source.userName.trim()
        ? source.userName
        : 'Unknown user',

    image:
      typeof source.image === 'string'
        ? source.image
        : '',

    createdAt: isFirestoreTimestamp(source.createdAt)
      ? source.createdAt
      : null,
  };
}

function getPostTimestamp(post: Post): number {
  if (!post.timestamp) {
    return 0;
  }

  try {
    return post.timestamp.toMillis();
  } catch {
    return 0;
  }
}

function getCommentTimestamp(
  comment: PostComment,
): number {
  if (!comment.createdAt) {
    return 0;
  }

  try {
    return comment.createdAt.toMillis();
  } catch {
    return 0;
  }
}

function formatPostDate(post: Post): string {
  if (!post.timestamp) {
    return 'Date unavailable';
  }

  try {
    return post.timestamp
      .toDate()
      .toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
  } catch (error: unknown) {
    console.error(
      `Invalid timestamp for post ${post.id}:`,
      error,
    );

    return 'Date unavailable';
  }
}

export default function Home({
  navigation,
}: HomeScreenProps): React.JSX.Element {
  const [posts, setPosts] = useState<Post[]>([]);
  const [failedPostImages, setFailedPostImages] = useState<Set<string>>(
    () => new Set(),
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentModalVisible, setCommentModalVisible] = useState<boolean>(false);
  const [userComment, setUserComment] = useState<string>('');
  const [trackedPost, setTrackedPost] = useState<Post | null>(null);
  const [currentUserInfo, setCurrentUserInfo] = useState<UserProfile | null>(null);
  const [submittingComment, setSubmittingComment] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const commentUnsubscribeRef = useRef<(() => void) | null>(null);

  /*
   * Load the current user's Firestore profile.
   */
  useEffect(() => {
    let active = true;

    const loadCurrentUserProfile =
      async (): Promise<void> => {
        const currentUser = getAuth().currentUser;

        if (!currentUser) {
          console.error(
            'Home opened without an authenticated user.',
          );
          return;
        }
        try {
          const profileSnapshot = await getDoc(
            doc(db, 'users', currentUser.uid),
          );
          if (!active) {
            return;
          }
          if (!profileSnapshot.exists()) {
            setCurrentUserInfo(null);
            console.error(
              'No user profile document exists for:',
              currentUser.uid,
            );
            return;
          }
          setCurrentUserInfo(
            profileSnapshot.data() as UserProfile,
          );
        } catch (error: unknown) {
          console.error(
            'Current user profile failed to load:',
            error,
          );
          if (active) {
            setCurrentUserInfo(null);
          }
        }
      };
    void loadCurrentUserProfile();
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    setLoading(true);
    setPostsError(null);
    let unsubscribePosts: (() => void) | null = null;
    const unsubscribeAuth = onAuthStateChanged(
      getAuth(),
      currentUser => {
        unsubscribePosts?.();
        unsubscribePosts = null;
        if (!currentUser) {
          setPosts([]);
          setPostsError('auth/no-current-user: Please log in again.');
          setLoading(false);
          return;
        }
        unsubscribePosts = onSnapshot(
          collection(db, 'posts'),
          snapshot => {
            const loadedPosts = snapshot.docs.map(
              postDocument =>
                mapPost(
                  postDocument.id,
                  postDocument.data() as UnknownPostDocument,
                ),
            );
            loadedPosts.sort(
              (firstPost, secondPost) =>
                getPostTimestamp(secondPost) -
                getPostTimestamp(firstPost),
            );
            setPosts(loadedPosts);
            setPostsError(null);
            setLoading(false);
            const totalPages = Math.max(
              1,
              Math.ceil(loadedPosts.length / PAGE_SIZE),
            );
            setPage(currentPage =>
              Math.min(currentPage, totalPages),
            );
          },
          error => {
            console.error(
              'Posts listener failed:',
              error.code,
              error.message,
            );

            setPosts([]);
            setPostsError(
              `${error.code}: ${error.message}`,
            );
            setLoading(false);
          },
        );
      },
    );
    return () => {
      unsubscribePosts?.();
      unsubscribeAuth();
    };
  }, []);

  useEffect(() => {
    return () => {
      commentUnsubscribeRef.current?.();
      commentUnsubscribeRef.current = null;
    };
  }, []);
  const handleLike = async (
    post: Post,
  ): Promise<void> => {
    const currentUser = getAuth().currentUser;
    if (!currentUser) {
      Alert.alert(
        'Authentication required',
        'Please log in again.',
      );
      return;
    }
    const postId = post.post_id || post.id;
    const existingLikes = post.likes ?? [];
    const userLiked = existingLikes.includes(
      currentUser.uid,
    );
    try {
      await updateDoc(
        doc(db, 'posts', postId),
        {
          likeCount: increment(
            userLiked ? -1 : 1,
          ),
          likes: userLiked
            ? arrayRemove(currentUser.uid)
            : arrayUnion(currentUser.uid),
        },
      );
    } catch (error: unknown) {
      console.error(
        'Like update failed:',
        error,
      );
      Alert.alert(
        'Like failed',
        'The like could not be updated.',
      );
    }
  };
  const handleComment = (post: Post): void => {
    commentUnsubscribeRef.current?.();
    commentUnsubscribeRef.current = null;
    setTrackedPost(post);
    setComments([]);
    setUserComment('');
    setCommentModalVisible(true);
    const postId = post.post_id || post.id;
    commentUnsubscribeRef.current = onSnapshot(
      collection(
        db,
        'posts',
        postId,
        'comments',
      ),
      snapshot => {
        const loadedComments = snapshot.docs.map(
          commentDocument =>
            mapComment(
              commentDocument.id,
              commentDocument.data() as UnknownCommentDocument,
            ),
        );
        loadedComments.sort(
          (firstComment, secondComment) =>
            getCommentTimestamp(firstComment) -
            getCommentTimestamp(secondComment),
        );
        setComments(loadedComments);
      },
      error => {
        console.error(
          'Comments listener failed:',
          error.message,
        );
        Alert.alert(
          'Unable to load comments',
          error.message,
        );
      },
    );
  };
  const closeComments = (): void => {
    commentUnsubscribeRef.current?.();
    commentUnsubscribeRef.current = null;
    setCommentModalVisible(false);
    setComments([]);
    setUserComment('');
    setTrackedPost(null);
  };
  const storeComment = async (): Promise<void> => {
    const trimmedComment = userComment.trim();
    if (!trimmedComment) {
      return;
    }
    if (!trackedPost) {
      Alert.alert(
        'Post unavailable',
        'No post is currently selected.',
      );
      return;
    }
    if (!currentUserInfo) {
      Alert.alert(
        'Profile unavailable',
        'Your user profile could not be loaded.',
      );
      return;
    }
    const postId =
      trackedPost.post_id || trackedPost.id;
    const fullName =
      `${currentUserInfo.f_name} ${currentUserInfo.l_name}`.trim();
    try {
      setSubmittingComment(true);
      await addDoc(
        collection(
          db,
          'posts',
          postId,
          'comments',
        ),
        {
          comment: trimmedComment,
          createdAt: serverTimestamp(),
          userName: fullName || 'BirdLens User',
          image: currentUserInfo.image || '',
        },
      );
      await updateDoc(
        doc(db, 'posts', postId),
        {
          commentCount: increment(1),
        },
      );
      setUserComment('');
    } catch (error: unknown) {
      console.error(
        'Comment submission failed:',
        error,
      );
      Alert.alert(
        'Comment failed',
        'Your comment could not be saved.',
      );
    } finally {
      setSubmittingComment(false);
    }
  };
  const renderPost: ListRenderItem<Post> = ({
    item,
  }) => {
    const currentUserId =
      getAuth().currentUser?.uid;
    const userLiked = currentUserId
      ? (item.likes ?? []).includes(currentUserId)
      : false;
    return (
      <View style={styles.postContainer}>
        <View style={styles.postHeader}>
          {item.author_image ? (
            <Image
              source={{uri: item.author_image}}
              style={styles.avatar}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text
                style={styles.avatarPlaceholderText}>
                {item.author_name
                  .charAt(0)
                  .toUpperCase() || '?'}
              </Text>
            </View>
          )}
          <View style={styles.authorInformation}>
            <Text style={styles.author}>
              {item.author_name}
            </Text>
            <Text style={styles.postDate}>
              {formatPostDate(item)}
            </Text>
          </View>
        </View>
        {item.message ? (
          <Text style={styles.message}>
            {item.message}
          </Text>
        ) : null}
        {item.image && !failedPostImages.has(item.id) ? (
          <Image
            source={{uri: item.image}}
            style={styles.postImage}
            resizeMode="cover"
            onError={() => {
              setFailedPostImages(current => {
                const next = new Set(current);
                next.add(item.id);
                return next;
              });
            }}
          />
        ) : (
          <View style={styles.noImageContainer}>
            <Text style={styles.noImageText}>
              No image available
            </Text>
          </View>
        )}
        <View style={styles.counterRow}>
          <Text style={styles.counterText}>
            Likes: {item.likeCount}
          </Text>
          <Text style={styles.counterText}>
            Comments: {item.commentCount}
          </Text>
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={
              userLiked
                ? 'Remove like'
                : 'Like this post'
            }
            style={styles.actionButton}
            onPress={() => {
              void handleLike(item);
            }}>
            <FontAwesome5
              name="thumbs-up"
              size={24}
              color={userLiked ? '#1877F2' : '#65676B'}
              solid={userLiked}
            />
            <Text
              style={[
                styles.actionText,
                userLiked &&
                  styles.selectedActionText,
              ]}>
              Like
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Open comments"
            style={styles.actionButton}
            onPress={() => handleComment(item)}>
            <FontAwesome5
              name="comment"
              size={28}
              color="#000000"
            />
            <Text style={styles.actionText}>
              Comment
            </Text>
          </TouchableOpacity>
        </View>
        {commentModalVisible &&
          trackedPost?.id === item.id && (
            <CommentModal
              visible={commentModalVisible}
              comments={comments}
              userComment={userComment}
              submitting={submittingComment}
              onCommentChange={setUserComment}
              onSubmit={storeComment}
              onClose={closeComments}
            />
)}
      </View>
      
    );
  };
  const paginatedPosts = useMemo<Post[]>(
    () =>
      posts.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE,
      ),
    [page, posts],
  );
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Go to Home"
          onPress={() =>
            navigation.navigate('Home')
          }>
          <Text style={styles.appName}>
            BirdLens
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Open Profile"
          onPress={() =>
            navigation.navigate('Profile')
          }>
          <Text style={styles.profileLink}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.menuRow}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Search for birds"
          style={styles.menuButton}
          onPress={() =>
            navigation.navigate('Search')
          }>
          <Ionicons
            name="search-circle-outline"
            size={38}
            color="#000000"
          />
          <Text style={styles.menuText}>
            Search
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Open About Us"
          style={styles.menuButton}
          onPress={() =>
            navigation.navigate('AboutUs')
          }>
          <Feather
            name="info"
            size={30}
            color="#000000"
          />
          <Text style={styles.menuText}>
            About us
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.feedContainer}>
        {loading ? (
          <Loader text="Loading posts..." />
        ) : postsError ? (
          <View style={styles.statusContainer}>
            <Text style={styles.errorTitle}>
              Unable to load posts
            </Text>
            <Text style={styles.errorMessage}>
              {postsError}
            </Text>
            <Text style={styles.errorHelp}>
              Verify that the app is connected to
              the correct Firebase project and that
              Firestore rules allow authenticated
              users to read the posts collection.
            </Text>
          </View>
        ) : (
          <FlatList
            data={paginatedPosts}
            renderItem={renderPost}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              paginatedPosts.length === 0
                ? styles.emptyList
                : styles.postList
            }
            ListEmptyComponent={
              <View style={styles.statusContainer}>
                <Text style={styles.emptyTitle}>
                  No posts available
                </Text>

                <Text style={styles.emptyText}>
                  Create the first post from your
                  BirdLens profile.
                </Text>
              </View>
            }
          />
        )}
      </View>
      {posts.length > PAGE_SIZE ? (
        <View style={styles.paginationContainer}>
          <Pagination
            currentPage={page}
            totalItems={posts.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </View>
      ) : null}
      
    </View>
  );
}
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#eeeeee',
    marginTop: 50,
  },
  header: {
    minHeight: 60,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#dddddd',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appName: {
    color: '#000000',
    fontSize: 40,
    fontWeight: 'bold',
  },
  profileLink: {
    color: '#1877f2',
    fontSize: 20,
    fontWeight: 'bold',
  },
  menuRow: {
    minHeight: 52,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuButton: {
    padding: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    marginLeft: 4,
    color: '#000000',
    fontSize: 24,
    fontWeight: 'bold',
  },
  feedContainer: {
    flex: 1,
  },
  postList: {
    paddingBottom: 10,
  },
  emptyList: {
    flexGrow: 1,
  },
  statusContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    color: '#000000',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 7,
    color: '#777777',
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
  },
  errorTitle: {
    color: '#b00020',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorMessage: {
    marginTop: 8,
    color: '#444444',
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
  },
  errorHelp: {
    marginTop: 12,
    color: '#777777',
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
  postContainer: {
    marginBottom: 10,
    backgroundColor: '#ffffff',
    elevation: 3,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  postHeader: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    marginRight: 10,
    backgroundColor: '#dddddd',
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    marginRight: 10,
    backgroundColor: '#1877f2',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  authorInformation: {
    flex: 1,
  },
  author: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  postDate: {
    marginTop: 2,
    color: '#666666',
    fontSize: 14,
  },
  message: {
    marginBottom: 10,
    paddingHorizontal: 10,
    color: '#111111',
    fontSize: 18,
    lineHeight: 25,
  },
  postImage: {
    width: '100%',
    height: 412,
    backgroundColor: '#eeeeee',
  },
  noImageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#eeeeee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImageText: {
    color: '#777777',
    fontSize: 16,
  },
  counterRow: {
    minHeight: 42,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counterText: {
    color: '#333333',
    fontSize: 17,
  },
  actionRow: {
    minHeight: 55,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#dddddd',
    flexDirection: 'row',
  },
  actionButton: {
    flex: 1,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    marginLeft: 6,
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedActionText: {
    color: '#1877f2',
  },
  paginationContainer: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#dddddd',
  },
});