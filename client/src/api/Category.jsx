import axios from "axios";

export const createCategory = async (token, form) => {
    // code
    return axios.post('http://localhost:5000/api/category', form,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    )
}

export const listCategory = async (token) => {
    // code
    return axios.get('http://localhost:5000/api/category',
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    )
}

export const removeCategory = async (token, id) => {
    // code
    return axios.delete('http://localhost:5000/api/category/'+id,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    )
}