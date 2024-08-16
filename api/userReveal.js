import express from 'express'

const router = express.Router()

router.get('/userReveal', (req, res) => {
  res.render('./userReveal/index', {
    users: process.client.runtimeVariables.users,
  })
})

export default router
