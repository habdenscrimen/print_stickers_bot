import { OrdersServices } from '..'
import { calculateOrderPrice } from './calculate_order_price'

export type OrderService<HandlerName extends keyof OrdersServices> = (
  args: Parameters<OrdersServices[HandlerName]>,
) => ReturnType<OrdersServices[HandlerName]>

export const newOrdersServices = (): OrdersServices => {
  return {
    CalculateOrderPrice: (...args) => calculateOrderPrice(args),
  }
}
