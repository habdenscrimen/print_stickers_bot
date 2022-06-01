import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

export const formatDate = (date: string) => {
  return dayjs(date).tz('Europe/Kiev').format('DD.MM.YYYY, HH:mm')
}
