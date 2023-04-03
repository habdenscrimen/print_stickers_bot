import { Order, User } from 'internal/domain'

export interface Services {
  Operational: OperationalService
}

export interface ResponseOrder extends Order {
  user: User
  stickerFiles: string[]
}

export interface OperationalGetDataResponse {
  orders: ResponseOrder[]
}

export interface OperationalService {
  GetData: () => Promise<OperationalGetDataResponse>
}
