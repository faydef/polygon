import React, { useEffect, useRef, useState } from 'react'
import { GetServerSideProps } from 'next'
import ReactMarkdown from 'react-markdown'
import Layout from '../../components/Layout'
import Router from 'next/router'
import Comment from '../../components/comment'

export type PostProps = {
  id: number;
  title: string;
  author: {
    name: string;
  }
  content: string;
  published: boolean;
  comments : [{author : {name:string};
  content:string;
id:number}]
  typing: boolean;
}

async function publish(id: number): Promise<void> {
  await fetch(`http://localhost:3001/publish/${id}`, {
    method: 'PUT',
  })
  await Router.push('/')
}

async function destroy(id: number): Promise<void> {
  await fetch(`http://localhost:3001/post/${id}`, {
    method: 'DELETE',
  })
  await Router.push('/')
}

async function writing(id: number, truth:string): Promise<void> {
  await fetch(`http://localhost:3001/writing/${id}/`+truth, {
    method: 'PUT',
  })
}

async function getProps(id:number) {
  const res = await fetch(`http://localhost:3001/post/${id}`)
  const data = await res.json()
  return { props: { ...data } }
}

const Post: React.FC<PostProps> = props => {
  let title = props.title
  if (!props.published) {
    title = `${title} (Draft)`
  }
  const id = props.id
  const [content, setContent] = useState(null)
  const [authorEmail, setAuthorEmail] = useState('')
  const [typing, setTyping] = useState(false)
  const [typingdb, setTypingdb] = useState(props.typing?props.typing:false)
  const isMounted = useRef(false);
  var status = 0

  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    try {
      await fetch(`http://localhost:3001/publish/${id}`, {
      method: 'PUT',
      })
      const body = { id, content, authorEmail }
      await fetch(`http://localhost:3001/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then(response => status = response.status)
      .catch(error => console.log(error))
      if (status == 404){
        Router.push('/signup')
      }
      else {
        Router.push(`/p/${id}`)
      }
    } catch (error) {
      console.error(error)
    }
  }
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`http://localhost:3001/writing/${props.id}`);
      const json = await res.json();
      setTypingdb(json.typing)
    }
    const interval = setInterval(() => {
      fetchData()
      .catch(console.error);
    }, 1000);
    return () => clearInterval(interval);
  }, [])
  useEffect(() => {
    if (isMounted.current) {
      setTyping(content!=='' && content!== null)
    }
}, [content]);
  useEffect(() => {
    if (isMounted.current) {
      writing(props.id, typing.toString())
    } else {
      isMounted.current = true;
    }
  }, [typing]);

  return (
    <Layout>
      <div>
        <h2>{title}</h2>
        <p>By {props?.author?.name || 'Unknown author'}</p>
        <ReactMarkdown children={props.content} />
        {!props.published && (
          <button onClick={() => publish(props.id)}>
            Publish
          </button>
        )}
        <button onClick={() => destroy(props.id)}>
          Delete
        </button>
      </div>
      <div>
        <form
          onSubmit={submitData}>
          <h1>Comment on this post</h1>
          {(typing ||typingdb)  && <p>someone is typing</p>}
          <input
            onChange={e => setAuthorEmail(e.target.value)}
            placeholder="Author (email address)"
            type="text"
            value={authorEmail}
          />
          <textarea
            cols={50}
            onChange={e => {setContent(e.target.value)
            setTyping(content!=='')}}
            placeholder="Content"
            rows={8}
            value={content}
          />
          <input
            disabled={!content || !title || !authorEmail}
            type="submit"
            value="Comment"
          />
        </form>
      </div>
      <style jsx>{`
        .page {
          background: white;
          padding: 2rem;
        }

        .actions {
          margin-top: 2rem;
        }

        button {
          background: #ececec;
          border: 0;
          border-radius: 0.125rem;
          padding: 1rem 2rem;
        }

        button + button {
          margin-left: 1rem;
        }
      `}</style>
      <style jsx>{`
        .page {
          background: white;
          padding: 3rem;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        input[type='text'],
        textarea {
          width: 100%;
          padding: 0.5rem;
          margin: 0.5rem 0;
          border-radius: 0.25rem;
          border: 0.125rem solid rgba(0, 0, 0, 0.2);
        }

        input[type='submit'] {
          background: #ececec;
          border: 0;
          padding: 1rem 2rem;
        }

        .back {
          margin-left: 1rem;
        }
      `}</style>
        <main>
          {props.comments.map(comment => (
            <div key={comment.id} className="post">
              <Comment comment={comment} />
            </div>
          ))}
        </main>
      <style jsx>{`
        .post {
          background: white;
          transition: box-shadow 0.1s ease-in;
        }

        .post:hover {
          box-shadow: 1px 1px 3px #aaa;
        }

        .post + .post {
          margin-top: 2rem;
        }
      `}</style>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const res = await fetch(`http://localhost:3001/post/${context.params.id}`)
  const data = await res.json()
  return { props: { ...data } }
}

export default Post


