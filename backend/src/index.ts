import { PrismaClient } from '@prisma/client'
import cors from 'cors'
import express from 'express'

const prisma = new PrismaClient()
const app = express()

app.use(express.json())
app.use(cors())

app.get('/drafts', async (req, res) => {
  const posts = await prisma.post.findMany({
    where: { published: false },
    include: { author: true }
  })
  res.json(posts)
})

app.get('/feed', async (req, res) => {
  const posts = await prisma.post.findMany({
    where: { published: true },
    include: { author: true }
  })
  res.json(posts)
})

app.get('/filterPosts', async (req, res) => {
  const { searchString }: { searchString?: string } = req.query;
  const filteredPosts = await prisma.post.findMany({
    where: {
      OR: [
        {
          title: {
            contains: searchString,
          },
        },
        {
          content: {
            contains: searchString,
          },
        },
      ],
    },
  })
  res.json(filteredPosts)
})

app.post(`/post`, async (req, res) => {
  const { title, content, authorEmail } = req.body
  const user = await prisma.user.findUnique({ where: { email: authorEmail } })
  if (user !== null) {
    const result = await prisma.post.create({
      data: {
        title,
        content,
        published: false,
        author: { connect: { email: authorEmail } },
      },
    })
    res.json(result)
  }
  else {
    res.status(404).json('user does not exist')
  }
})

app.delete(`/post/:id`, async (req, res) => {
  const { id } = req.params
  const post = await prisma.post.delete({
    where: {
      id: Number(id),
    },
  })
  res.json(post)
})

app.get(`/post/:id`, async (req, res) => {
  const { id } = req.params
  const post = await prisma.post.findUnique({
    where: {
      id: Number(id),
    },
    include: { author: true, comments: { include: { author: { select: { name: true } } } } }
  })
  res.json(post)
})

app.put('/publish/:id', async (req, res) => {
  const { id } = req.params
  const post = await prisma.post.update({
    where: { id: Number(id) },
    data: { published: true },
  })
  res.json(post)
})

app.post(`/user`, async (req, res) => {
  const result = await prisma.user.create({
    data: {
      ...req.body,
    },
  })
  res.json(result)
})

app.get('/comments', async (req, res) => {
  const comments = await prisma.comment.findMany()
  res.json(comments)
})

app.get(`/comment/:authorid/:postId`, async (req, res) => {
  const id1 = req.params.authorid
  const id2 = req.params.postId
  const comments = await prisma.comment.findMany({
    where: {
      AND: [
        {
          postId: Number(id2),
        },
        {
          authorId: Number(id1)
        },
      ],
    },
  })
  res.json(comments)
})

app.get(`/commentByPost/:postId`, async (req, res) => {
  const id = req.params.postId
  const comments = await prisma.comment.findMany({
    where: {
      postId: Number(id),
    },
  })
  res.json(comments)
})

app.get(`/commentByAuthor/:authorId`, async (req, res) => {
  const id = req.params.authorId
  const comments = await prisma.comment.findMany({
    where: {
      postId: Number(id),
    },
  })
  res.json(comments)
})

app.post(`/comment`, async (req, res) => {
  const { id, content, authorEmail } = req.body
  const user = await prisma.user.findUnique({ where: { email: authorEmail } })
  const post = await prisma.post.findUnique({ where: { id: Number(id) } })
  if (user !== null) {
    const result = await prisma.comment.create({
      data: {
        content,
        author: { connect: { email: authorEmail } },
        post: { connect: { id: Number(id) } }
      },
    })
    res.json(result)
  }
  else {
    res.status(404).json('user does not exist')
  }
})

app.put('/writing/:id/:truth', async (req, res) => {
  const { id, truth } = req.params
  const typing = truth === 'true'
  const post = await prisma.post.update({
    where: { id: Number(id) },
    data: { typing: typing },
  })
  res.json(post)
})

app.get(`/writing/:id`, async (req, res) => {
  const { id } = req.params
  const post = await prisma.post.findUnique({
    where: {
      id: Number(id),
    },
    select: { typing: true }
  })
  res.json(post)
})




const server = app.listen(3001, () =>
  console.log(
    '🚀 Server ready at: http://localhost:3001',
  ),
)
