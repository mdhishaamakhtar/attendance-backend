import { SuccessResponse, ErrorResponse } from './interface'
import EventSchema from './schema'
import logger from '../logger/winston'
import { Request, Response } from 'express'

class EventOperations {
  static add(req: Request) {
    return new Promise<SuccessResponse>((resolve, reject) => {
      try {
        EventSchema.create(req.body.event)
          .then((resp) => {
            resolve({
              error: false,
              message: 'Event created successfully',
              payload: resp,
            })
          })
          .catch((error: any) => {
            if (error.errmsg) {
              logger.error(`DB : ${error.errmsg}`)
              reject({
                error: true,
                payload: error,
                message: 'error in db operation to create a new event',
              })
            }

            if (error.errors) {
              logger.error(`Validation: ${error.message}`)
              reject({
                error: true,
                message: 'Validation Error',
                payload: error,
              })
            }

            // if no errors, then resolve with success
            reject({
              error: true,
              message: 'Unexpected error',
              payload: {},
            })
          })
      } catch (e) {
        reject({
          error: true,
          message: 'unexpected error in creating new event',
          payload: e,
        })
      }
    })
  }

  static delete(req: Request) {
    return new Promise<SuccessResponse>((resolve, reject) => {
      if (!req.params.eventname) {
        reject({
          error: true,
          message: 'eventname required to delete event',
          payload: {},
        })
      }

      try {
        EventSchema.deleteOne({ username: req.params.eventname })
          .then((resp) => {
            if (resp.deletedCount === 1) {
              resolve({
                error: false,
                message: 'event deletion successful',
                payload: {},
              })
            }
            reject({
              error: true,
              message: 'event not found',
              payload: {},
            })
          })
          .catch((err) => {
            logger.error('error in deleting event')
            reject({
              error: true,
              message: 'unexpected error in deleting event',
              payload: err,
            })
          })
      } catch (error) {
        reject({
          error: true,
          message: 'unexpected error in deleting event',
          payload: error,
        })
      }
    })
  }

  static getUser(req: Request) {
    return new Promise<SuccessResponse>((resolve, reject) => {
      if (!req.params.eventname) {
        reject({
          error: true,
          message: 'eventname required to return details',
          payload: {},
        })
      }

      EventSchema.findOne({ username: req.params.eventname })
        .then((event) => {
          if (!event) {
            reject({
              error: true,
              message: 'event not found',
              payload: {},
            })
          }
          resolve({
            error: false,
            message: 'event details found',
            payload: event,
          })
        })
        .catch((err) => {
          logger.error('error getting event data')
          reject({
            error: true,
            message: 'unexpected error fetching event data',
            payload: err,
          })
        })
    })
  }

  static update(req: Request) {
    return new Promise<SuccessResponse>((resolve, reject) => {
      // check if username to be updated actually exists
      if (!req.body.event || !req.body.event._id) {
        reject({
          error: true,
          message: 'event._id needed to update document',
          payload: {},
        })
      }

      EventSchema.findByIdAndUpdate(req.body.event._id, {
        $set: req.body.event,
      })
        .exec()
        .then(() => {
          resolve({
            error: false,
            message: 'event update successful',
            payload: {},
          })
        })
        .catch((err) => {
          logger.error('error updating event')
          reject({
            error: true,
            message: 'error updating event by id',
            payload: err,
          })
        })
    })
  }
}

export default EventOperations
