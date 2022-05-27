export interface StickerData {
  width: number
  height: number
  emoji: string
  set_name: string
  is_animated: boolean
  is_video: boolean
  thumb?: {
    file_id: string
    file_unique_id: string
    file_size: number
    width: number
    height: number
  }
  file_id: string
  file_unique_id: string
  file_size: number
}

export const stickersData: StickerData[] = [
  {
    width: 512,
    height: 512,
    emoji: '👍',
    set_name: 'kitani',
    is_animated: false,
    is_video: false,
    thumb: {
      file_id: 'AAMCAgADGQEAAhtvYpCRWxXLDiygf5rPKtkDu_wTi-gAAigAA6G2EQh-VY56Yw58iwEAB20AAyQE',
      file_unique_id: 'AQADKAADobYRCHI',
      file_size: 3894,
      width: 128,
      height: 128,
    },
    file_id: 'CAACAgIAAxkBAAIbb2KQkVsVyw4soH-azyrZA7v8E4voAAIoAAOhthEIflWOemMOfIskBA',
    file_unique_id: 'AgADKAADobYRCA',
    file_size: 22946,
  },
  {
    width: 512,
    height: 512,
    emoji: '😐',
    set_name: 'kitani',
    is_animated: false,
    is_video: false,
    thumb: {
      file_id: 'AAMCAgADGQEAAhtxYpCRd_ymNTOdy2HRbTpDLgHjRhYAAjAAA6G2EQjhnjKbQ53aZQEAB20AAyQE',
      file_unique_id: 'AQADMAADobYRCHI',
      file_size: 3924,
      width: 128,
      height: 128,
    },
    file_id: 'CAACAgIAAxkBAAIbcWKQkXf8pjUzncth0W06Qy4B40YWAAIwAAOhthEI4Z4ym0Od2mUkBA',
    file_unique_id: 'AgADMAADobYRCA',
    file_size: 25430,
  },
  {
    width: 512,
    height: 512,
    emoji: '😘',
    set_name: 'kitani',
    is_animated: false,
    is_video: false,
    thumb: {
      file_id: 'AAMCAgADGQEAAhtzYpCRkT3EYzfcaMkat-CxX8eZJl8AAowAA6G2EQhKruQ7Ivu5egEAB20AAyQE',
      file_unique_id: 'AQADjAADobYRCHI',
      file_size: 15022,
      width: 320,
      height: 320,
    },
    file_id: 'CAACAgIAAxkBAAIbc2KQkZE9xGM33GjJGrfgsV_HmSZfAAKMAAOhthEISq7kOyL7uXokBA',
    file_unique_id: 'AgADjAADobYRCA',
    file_size: 31860,
  },
]
