export interface APIs {
  // Payment Service Provider
  PSP: PSPApi
}

export interface PSPApi {
  CreateRefund: (transactionID: number) => Promise<void>
}
