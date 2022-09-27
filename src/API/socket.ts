import { Server as SocketIO, Socket as ioSocket } from 'socket.io'
import { Server } from 'http'
import { TestHooks } from './hooks/test.hooks'
import { Express } from './express'

export class Socket {
  static io: SocketIO
  private connections: ioSocket[] = []

  constructor(server: Server) {
    Socket.io = new SocketIO(server, {
      path: '/api/socket.io',
      transports: ['websocket', 'polling'],
      cors: {
        origin: Express.origins,
        optionsSuccessStatus: 200,
        credentials: true,
      },
    })

    Socket.io.use(globalAsyncErrorCatcher())
  }

  async bindEvents() {
    Socket.io.on('connection', (socket: ioSocket) => {
      this.connections.push(socket)

      socket.on('bind', (data) => {
        socket.join(data.userId)
      })

      new TestHooks(Socket.io, socket)

      socket.on('unbind', (data) => {
        socket.leave(data.userId)
      })

      socket.on('disconnect', () => {
        this.connections.splice(this.connections.indexOf(socket), 1)
        //console.info(`Client with id ${socket.id} disconnected...`)
      })
    })
  }
}

const globalAsyncErrorCatcher =
  ({ handleError = Promise.reject.bind(Promise) } = {}) =>
  (socket, next) => {
    const on = socket.on.bind(socket)
    socket.on = (event, handler, ...args) => {
      const newHandler = (...handlerArgs) => {
        const result = handler(...handlerArgs)?.catch?.((err) => {
          socket.emit('error', err)
        })

        if (typeof result?.then === 'function') {
          const cb = handlerArgs.at(-1)
          if (typeof cb === 'function') {
            result.then(cb.bind(null, null), cb)
          }
        }
      }

      on(event, newHandler, ...args)
    }

    next()
  }
