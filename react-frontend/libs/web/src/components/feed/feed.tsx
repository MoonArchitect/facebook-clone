"use client"

// import { getApp } from "firebase/app";
// import { getFirestore, collection, getDocs, QueryDocumentSnapshot, CollectionReference, query, orderBy } from 'firebase/firestore';
// Interfaces for Firebase
// import { IPostScoresDocument } from "Firebase/IFirebase";

// import feed_posts from 'assets/posts_data.json';

// import { useEffect, useState } from "react"

// import { Post } from "./Post/Post"

import { Post } from "../post/post"
import { CreatePostSection } from "./create-post-section/create-post-section"

import styles from "./feed.module.scss"

// const app = getApp()
// const db = getFirestore(app)
// const postScoresCollection = collection(db, "post_scores")
// const getSortedPostScores = query(
//   postScoresCollection as CollectionReference<IPostScoresDocument>,
//   orderBy("score", "desc")
// ) // TODO: do not use `as`, find something better

// Content types to add:
//  People also search for
//  Suggested groups
//  JobContent
//  MapContent
//  MarketplaceContent

export const Feed = () => {
  // const [postScores, setPostScores] = useState<
  //   QueryDocumentSnapshot<IPostScoresDocument>[]
  // >([])

  // useEffect(() => {
  //   setTimeout(() => {
  //     console.log("Attempt fetch")
  //     getDocs<IPostScoresDocument>(getSortedPostScores)
  //       .then((snapshot) => setPostScores(snapshot.docs))
  //       .catch((e) => console.log("Couldn't load post scores: " + e))
  //   }, 10) // TODO assert auth is aquired before fetching, and if failed for other reasons -> retry
  // }, [])

  // return (
  //   <div className="feed-container">
  //     {postScores &&
  //       postScores.map((post_score) => (
  //         <Post key={post_score.id} data={post_score.data()} />
  //       ))}
  //   </div>
  // )
  return (
    <div className={styles.container}>
      <CreatePostSection />
      <Post />
      <Post />
      <Post />
      <Post />
      <Post />
    </div>
  )
}
