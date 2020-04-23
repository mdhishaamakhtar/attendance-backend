import { Request, Response } from 'express'
import logger from '../logger/winston'
import jwt from 'jsonwebtoken'

const authMiddleware = (req: any, res: any, next: any) => {
  // if headers dont exist
  if (!req.headers.authorization) {
    logger.warn('Request Without Token Denied')
    return res.status(400).json({
      error: true,
      message: 'Not allowed without headers',
      payload: undefined,
    })
  }

  //   try ripping apart the header to see if data sent in correct format
  const auth = req.headers.authorization.split(' ')
  if (auth.length !== 2) {
    logger.warm('Request in improper format: Send as Bearer token')
    return res.status(400).json({
      error: true,
      message: 'Invalid Header String',
      payload: undefined,
    })
  }

  let data
  try {
    data = jwt.verify(auth[1], String(process.env.SECRETKEY))
  } catch (e) {
    return res.status(403).json({
      error: true,
      message: 'Unauthorized Accedd Denied',
      payload: undefined,
    })
  }

  req.client = data
  next()
}
export default authMiddleware
