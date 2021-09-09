import './App.css';
import React, { useState, useRef } from 'react';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

import {useAuthState} from 'react-firebase-hooks/auth';
import {useCollectionData} from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyBnguiTWs4NUrDkgM3Wakr31EUStw_YbJ8",
  authDomain: "superchat-f1754.firebaseapp.com",
  projectId: "superchat-f1754",
  storageBucket: "superchat-f1754.appspot.com",
  messagingSenderId: "1089054789117",
  appId: "1:1089054789117:web:9cfcbce4751bde557a9d94",
  measurementId: "G-Z90QMJKLNK"
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  
  const [user] =  useAuthState(auth);
  return (
    <div className="App">
      <header> 
        <SignOut/>
      </header>
      <section>
        {user ? <ChatRoom/> : <Signin />}
      </section>
    </div>
  );
}

function Signin() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

function SignOut() {
  return auth.currentUser &&  (
    <button onClick={() => auth.signOut()}>Sign out</button>
  )
}

function ChatRoom() {
  
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id'});

  const [formValue, setFormValue] = useState('');
  const sendMessage = async(e) => {
    e.preventDefault();
    const {uid, photoURL} = auth.currentUser;
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth'})
  }
  return (
    <>
    <main>
      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg}/>)}
      <div ref={dummy}></div>
    </main>
    <form onSubmit={sendMessage}>
      <input value={formValue} onChange={(e) => setFormValue(e.target.value)}/>
      <button type='submit'>Send</button>
    </form>
    </>
  )
}

function ChatMessage(props) {
  const {text, uid, photoURL} = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'recieved';
  return (
  <div className={`message ${messageClass}`}>
      <img src={photoURL} alt='user'/>
      <p>{text}</p>
    </div>
  );
}
export default App;
