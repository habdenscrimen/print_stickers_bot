import { Composer } from 'grammy'
import { CustomContext } from '../../context'
import { deliveryRouter } from './router'

export const deliveryComposer = new Composer<CustomContext>()

// use routers
deliveryComposer.use(deliveryRouter)
