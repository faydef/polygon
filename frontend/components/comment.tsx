import React from 'react'
import Router from 'next/router'
import ReactMarkdown from 'react-markdown'

export type CommentProps = {
  id: number;
  author:{name:string};
  content: string;
}

const Comment: React.FC<{comment: CommentProps}> = ({ comment }) => {
  const authorName = comment.author.name ? comment.author.name : 'Unknown commentor'
  return (
    <div className='comment' onClick={() => Router.push('/p/[id]', `/p/${comment.id}`)}>
        <h2>{authorName}</h2>
        <ReactMarkdown children={comment.content} />
        <style jsx>{`
          div {
            color: inherit;
            padding: 2rem;
          }
        `}</style>
    </div>
  )
}

export default Comment