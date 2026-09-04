/* global jest */

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: (_auth, callback) => {
    callback(null);
    return () => {};
  },
}));

jest.mock('./backend', () => ({
  auth: {},
  loginUser: jest.fn(),
  logoutUser: jest.fn(),
  registerUser: jest.fn(),
  watchPosts: jest.fn(() => () => {}),
  createPost: jest.fn(),
}));
