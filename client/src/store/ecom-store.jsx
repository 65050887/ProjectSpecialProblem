import axios from "axios"
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

const ecomStore = (Set) => ({
    user: null,
    token: null,
    actionLogin: async(form) => {
        // console.log('Login action from ecomStore')
        const res = await axios.post('http://localhost:5000/api/login', form)
        // console.log(res.data.token)
        Set({
            user: res.data.payload,
            token: res.data.token
        })
        return res
    } 
})

const usePersist = {
    name: 'ecom-storage',
    storage: createJSONStorage(() => localStorage)
}

const useEcomStore = create(persist(ecomStore, usePersist))

export default useEcomStore
