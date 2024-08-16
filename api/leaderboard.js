import express from 'express'
import { getLeaderboard } from '../handlers/leaderboard'
import { getClient } from '../handlers/mongodb'

const router = express.Router()

router.get('/api/leaderboard', (req, res) => {
  //check if query param division
  if (!req.query.division) {
    return res.status(400).send('Division query param is required')
  }

  db = getClient()

  //get leaderboard data
  getLeaderboard(db, req.query.division)
    .then((data) => {
      res.status(200).json(data)
    })
    .catch((err) => {
      res.status(500).send(err)
    })
})

export default router
