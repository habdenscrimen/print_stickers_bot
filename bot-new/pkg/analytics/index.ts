import MP from 'mixpanel'

interface SetUserOptions {
  id: number
  firstName?: string
  lastName?: string
  username?: string
  phoneNumber?: string
  createdAt?: string
  source?: string
}

export class Analytics {
  private mixpanel: MP.Mixpanel

  constructor(projectToken: string) {
    this.mixpanel = MP.init(projectToken, {
      host: 'api-eu.mixpanel.com',
    })
  }

  setUser(options: SetUserOptions) {
    const { id, firstName, createdAt, lastName, phoneNumber, username, source } = options

    this.mixpanel.people.set(id.toString(), {
      $first_name: firstName,
      $last_name: lastName,
      $created: createdAt,
      phone: phoneNumber,
      username,
      source,
    })
  }

  trackEvent(eventName: string, userID: number, properties?: Record<string, unknown>) {
    this.mixpanel.track(
      eventName,
      {
        distinct_id: userID.toString(),
        ...properties,
      },
      (error) => {
        if (error) {
          console.error(`Error tracking event ${eventName}`, error)
        }
      },
    )
  }
}
