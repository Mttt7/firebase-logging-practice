import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import {
  AngularFirestore,
  AngularFirestoreDocument
} from '@angular/fire/compat/firestore';

import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs';
import { User } from './user.model';

import { GoogleAuthProvider } from 'firebase/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user$: Observable<User>;
  posts = []

  constructor(
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    private afs: AngularFirestore, // Inject Firestore service
    private router: Router
  ) {
    this.user$ = this.afAuth.authState.pipe(
      switchMap((user) => {
        // Logged in
        if (user) {
          return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
        }
        // Logged out
        else {
          return of(null);
        }
      })
    )
  }

  async googleSignin() {
    const provider = new GoogleAuthProvider();
    const credential = await this.afAuth.signInWithPopup(provider);
    return this.updateUserData(credential.user);
  }

  async signOut() {
    await this.afAuth.signOut();
    return this.router.navigate(['/']);
  }

  private updateUserData(user) {
    // Sets user data to firestore on login
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(
      `users/${user.uid}`
    );
    const data = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };
    return userRef.set(data, { merge: true });
  }

  getPosts(): Observable<any[]> {
    const collection = this.afs.collection('users');
    return from(this.afAuth.currentUser).pipe(
      switchMap((user: User | null) => {
        if (user) {
          const userId = user.uid;
          const userDocRef = collection.doc(userId);
          const userPostsCollectionRef = userDocRef.collection('posts');
          return userPostsCollectionRef.valueChanges();
        } else {
          return of([]); // Zwróć pustą tablicę, gdy użytkownik nie jest zalogowany
        }
      })
    )
  }

  async addNewPost() {
    const collection = this.afs.collection('users');
    const userId = await this.afAuth.currentUser.then((user) => {
      return user.uid;
    })
    const userDocRef = collection.doc(userId);
    const userPostsCollectionRef = userDocRef.collection('posts');


    console.log(this.posts);

    const postData = {
      title: 'My first post',
      content: 'This is my first post',
      created: new Date()
    }
    userPostsCollectionRef.add(postData)
      .then((docRef) => {
        console.log('Document written with ID: ', docRef.id);
      })
      .catch((error) => {
        console.error('Error adding document: ', error);
      })

    console.log(userId);
  }



}