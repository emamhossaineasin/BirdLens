type FirestoreTimestamp = {
  seconds: number;
  nanoseconds: number;
  toDate(): Date;
  toMillis(): number;
  isEqual(other: FirestoreTimestamp): boolean;
};

export type UserProfile = {
  user_id: string;
  f_name: string;
  l_name: string;
  email: string;
  phone: string;
  image: string;
  dob: FirestoreTimestamp | null;
  country: string | null;
  sub_division: string | null;
  latitude: number | null;
  longitude: number | null;
  rating?: number;
};

export type Post = {
  id: string;
  post_id: string;
  message: string;
  author_name: string;
  author_id: string;
  author_image: string;
  image: string;
  likeCount: number;
  commentCount: number;
  likes?: string[];
  timestamp: FirestoreTimestamp | null;
};

export type PostComment = {
  id: string;
  comment: string;
  userName: string;
  image: string;
  createdAt: FirestoreTimestamp | null;
};

export type GeographicRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export type Subdivision = {
  name: string;
};

export type Country = {
  name: string;
  subdivisions: Subdivision[];
};

export type CountriesQueryData = {
  countries: Country[];
};