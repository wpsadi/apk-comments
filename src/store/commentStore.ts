// @ts-nocheck
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import { env } from "../env";
import { AppwriteException, Client, Databases, ID, Models, Query } from "appwrite"

const client = new Client();
client
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('66e008710011a20bfb9f');


const db = new Databases(client);

export interface Comment {
  id: string,
  author: string,
  timestamp: number,
  likes: number,
  dislikes: number,
  content: string,
  userAction: null
}

interface ICStore {
  hydrated: boolean
  hashPresent(hash: string): Promise<{
    success: boolean,
    new?: boolean,
    error?: string
  }>

  getComments(hash: string): Promise<{
    success: boolean,
    comments?: Comment[],
    error?: string
  }>

  postComment(content: string, hash: string): Promise<{
    success: boolean,
    // comments?:Comment[] ,
    error?: string
  }>

  updatelLikeDislike(id: string, action: "like" | "dislike"): Promise<{
    success: boolean,
    // comments?:Comment[] ,
    error?: string
  }>

  setHydrated(): void;

}


export const useCStore = create<ICStore>()(
  persist(
    immer((set) => ({

      hydrated: false,

      async hashPresent(hash) {
        try {
          hash = hash.toLowerCase().trim()
          const result = await (db.listDocuments(env.db.id, env.db.collections.comment.id, [Query.limit(1), Query.select(["$id"])]).catch(e => { throw new Error(e.message || "something went wrong") }))

          if (result.total > 0) {
            return {
              success: true,
              new: false
            }
          }

          return {
            success: true,
            new: true
          }

        } catch (e: any) {
          return {
            success: false,
            error: e.message as string || "something went wrong"
          }
        }
      },

      // @ts-ignore
      async getComments(hash) {
        try {
          hash = hash.toLowerCase().trim()
          const result = await (db.listDocuments(env.db.id, env.db.collections.comment.id, [Query.contains("hash", hash), Query.select(["likes", "dislikes", "$id", "comment", "$createdAt"])]).catch(e => { throw new Error(e.message || "something went wrong") }))

          if (!(result.total > 0)) {
            throw new Error("new hash found")
          }

          const data = result.documents

          const modifiedData = data.map(i => {
            return {

              id: i.$id,
              timestamp: new Date(i.$createdAt).getTime(),
              // hash:i.hash,
              likes: i.likes,
              author: "Anon",
              dislikes: i.dislikes,
              content: i.comment,
              userAction: null
            }
          })

          return {
            success: true,
            comments: modifiedData
          }

        } catch (e: any) {
          return {
            success: false,
            error: e.message as string || "something went wrong"
          }
        }
      },

      async postComment(content, hash) {
        try {
          hash = hash.toLowerCase().trim()

          await db.createDocument(env.db.id, env.db.collections.comment.id, ID.unique(), {
            comment: content,
            hash: hash
          })


          return {
            success: true
          }

        } catch (e: any) {
          return {
            success: false,
            error: e.message as string || "something went wrong"
          }
        }
      },

      async updatelLikeDislike(id, action) {
        try {
          console.log("updat")
          let commentData;
          switch (action) {
            case "like":
              commentData = await db.getDocument(env.db.id, env.db.collections.comment.id, id, [Query.select("likes")])

              await db.updateDocument(env.db.id, env.db.collections.comment.id, id, {
                likes: commentData.likes + 1,
              })
              break;
            case "dislike":
              commentData = await db.getDocument(env.db.id, env.db.collections.comment.id, id, [Query.select("dislikes")])
              await db.updateDocument(env.db.id, env.db.collections.comment.id, id, {
                dislikes: commentData.dislikes + 1,
              })
              break;

          }
         

          return {
            success: true
          }

        } catch (e: any) {
          return {
            success: false,
            error: e.message as string || "something went wrong"
          }
        }
      },

      setHydrated() {
        set({ hydrated: true })
      },











    })),
    {
      name: "comments",
      onRehydrateStorage() {
        return (state, error) => {
          if (!error) state?.setHydrated()
        }
      }
    }
  )
)