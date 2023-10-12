import { $fetch } from 'ohmyfetch'
import { defineStore } from 'pinia'

export const baseUrl = process.env.NODE_ENV == 'production' ?
    'https://weather-data-2.fly.dev' : 'http://localhost:3001'


const fetcher = $fetch.create({ baseURL: `${baseUrl}` })

export const useUserStore = defineStore('users', {
    state: () => ({
        user: {
            data: "",
            tokens: {
                access: {
                    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NTI3ZTRhNjE1ZWJmYTBiYzRhNWM4MmEiLCJpYXQiOjE2OTcxMTMyNTQsImV4cCI6MzE3MDU3MTEzMjU0LCJ0eXBlIjoiYWNjZXNzIn0.2NOVEbqqD3Sqd8R-hddqh63-tS7lLGoF2j4BNZ66CTM",
                    expires: "+012017-02-20T12:20:54.326Z"
                },
                refresh: {
                    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NTI3ZTRhNjE1ZWJmYTBiYzRhNWM4MmEiLCJpYXQiOjE2OTcxMTMyNTQsImV4cCI6NTQyOTU5MzI1NCwidHlwZSI6InJlZnJlc2gifQ.G4xMXPHEe65HB20CvvrLAlxcncXdKRU6CLpIMxe0GAY",
                    expires: "2142-01-21T12:20:54.329Z"
                }
            }
        }
    }),
    getters: {
        token(state) {
            // const user = localStorage.getItem('weather_app_user')
            // let userData = {} as any
            // let tokens = {} as any
            // if (user) {
            //     userData = JSON.parse(user)
            //     tokens = userData?.tokens
            // }
            // return tokens?.access?.token
            return state.user.tokens.access.token
        }
    },
    actions: {
        async login(data: any) {
            const userData = await fetcher('/auth/login', {
                method: 'POST',
                body: data
            })
            const { user, tokens } = userData
            this.user = {
                data: user,
                tokens
            }
            localStorage.setItem('weather_app_user', JSON.stringify(this.user))
        }
    },
    persist: false

})