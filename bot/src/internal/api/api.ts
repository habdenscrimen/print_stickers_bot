export interface APIs {
  // Payment Service Provider
  PSP: PSPApi
}

export interface PSPApi {
  CreateRefund: (options: {
    orderID: string
    amount: number
  }) => Promise<{ wait_reserve?: boolean; wait_amount?: boolean }>
}
