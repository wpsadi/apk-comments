'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react'
import {useCStore} from "@/store/commentStore"
import { resolve } from 'path'
type Comment = {
  id: string
  author: string
  content: string
  timestamp: number
  likes: number
  dislikes: number
  userAction: 'like' | 'dislike' | null
}

export default function HashCommentsPage() {
  const { hash } = useParams()

  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const cStore = useCStore()
  useEffect(() => {
    // Simulating fetching comments
    const fetchComments = async () => {
      // In a real app, you'd fetch comments from an API
      const check = await (await cStore.hashPresent(hash as string))
      if (!check.success){
        console.log("Can't access db")
        return;
      }
      if(check.new === true) return
      console.log(await cStore.getComments(hash as string))
      const res = await (await cStore.getComments(hash as string))
      // console.log(res)
      const comm = res.success ?(res.comments as any) : [] 
      console.log(comm)
      const mockComments: Comment[] = res.success ?(res.comments as any) : [] 
      // const  mockComments = []
      setComments(mockComments)
    }
    fetchComments()
  }, [])

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return
    setIsSubmitting(true)
    // Simulating API call to submit comment
    await new Promise(resolve => cStore.postComment(newComment,hash as string).finally(()=>resolve(true)))
    const newCommentObj: Comment = {
      id: Date.now().toString(),
      author: 'Anon',
      content: newComment,
      timestamp: Date.now(),
      likes: 0,
      dislikes: 0,
      userAction: null
    }
    setComments(prevComments => [newCommentObj, ...prevComments])
    setNewComment('')
    setIsSubmitting(false)
  }

  const handleAction = async (commentId: string, action: 'like' | 'dislike') => {

    setComments(prevComments => 
      prevComments.map(comment => {
        if (comment.id === commentId) {
          if (comment.userAction === action) {
            // Undo the action
            return {
              ...comment,
              // @ts-ignore
              [action + 's']: comment[action + 's'] - 1,
              userAction: null
            }
          } else {
            // Apply new action
            // @ts-ignore
            console.log("h")
            cStore.updatelLikeDislike(commentId,action)
            // new Promise(resolve=>.finally(()=>resolve(true)))
            // @ts-ignore
            return {
              ...comment,
              likes: action === 'like' ? comment.likes + 1 : comment.likes - (comment.userAction === 'like' ? 1 : 0),
              dislikes: action === 'dislike' ? comment.dislikes + 1 : comment.dislikes - (comment.userAction === 'dislike' ? 1 : 0),
              userAction: action
            }
          }
        }
        return comment
      })
    )

    // Simulating API call to update like/dislike
    await new Promise(resolve => setTimeout(resolve, 500))
    // In a real app, you'd update the server here
  }

  console.log(comments)
  const sortedComments = comments.sort((a, b) => {
    const scoreA = a.likes - a.dislikes
    const scoreB = b.likes - b.dislikes
    return scoreB - scoreA || b.timestamp - a.timestamp
  })

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8">
      {/* <h1 className="text-3xl font-bold text-center">Hash: {hash}</h1> */}
      
      <Card>
        <CardHeader>
          <CardTitle>Add a Comment</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Write your comment here... (max 1000 characters)"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value.slice(0, 1000))}
            rows={4}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleCommentSubmit} disabled={isSubmitting || !newComment.trim()}>
            {isSubmitting ? 'Submitting...' : 'Submit Comment'}
          </Button>
        </CardFooter>
      </Card>

      <div className="space-y-4">
        {sortedComments.map(comment => (
          <Card key={comment.id}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${comment.author}`} />
                  <AvatarFallback>{comment.author[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-sm font-medium">{comment.author}</CardTitle>
                  <p className="text-xs text-gray-500">{new Date(comment.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {comment.content.length > 200 ? (
                <>
                  <p>{comment.content.slice(0, 200)}...</p>
                  <Button variant="link" onClick={() => alert(comment.content)}>See more</Button>
                </>
              ) : (
                <p>{comment.content}</p>
              )}
            </CardContent>
            <CardFooter>
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAction(comment.id, 'like')}
                  className={comment.userAction === 'like' ? 'text-green-500' : ''}
                >
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  {comment.likes}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAction(comment.id, 'dislike')}
                  className={comment.userAction === 'dislike' ? 'text-red-500' : ''}
                >
                  <ThumbsDown className="w-4 h-4 mr-1" />
                  {comment.dislikes}
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
        {comments.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p>No comments yet. Be the first to comment!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}