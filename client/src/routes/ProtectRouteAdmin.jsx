import React, {useState, useEffect} from 'react'
import useEcomStore from '../store/ecom-store'
import { currentAdmin } from '../api/auth'
import LoadingToRedirect from './LoadingToRedirect'
// import

const ProtectRouteAdmin = ({element}) => {
    const [ok, setOk] = useState(false)
    const user = useEcomStore((state) => state.user)
    const token = useEcomStore((state) => state.token)
    // console.log(token)

    useEffect(() => {
        if(user && token){
            // send to backend
            currentAdmin(token)
                .then((res) => setOk(true))
                .catch((err) => setOk(false));
        }else{
            setOk(false);
        }
    }, [user, token])

    return ok ? element : <LoadingToRedirect />
}

export default ProtectRouteAdmin