import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import 'firebase/storage'

const config = {
  apiKey: 'AIzaSyDakn-Hcg7kNXuRGdnvTAJBTdLUISGOQDE',
  authDomain: 'react-slack-21746.firebaseapp.com',
  databaseURL: 'https://react-slack-21746.firebaseio.com',
  projectId: 'react-slack-21746',
  storageBucket: 'react-slack-21746.appspot.com',
  messagingSenderId: '358478693195',
}
firebase.initializeApp(config)

export default firebase
