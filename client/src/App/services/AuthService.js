export default {
    login: userDetails => {
        //console.log("Login SERVICE")
        return fetch('/api/login', {
            method: 'POST',
            body: JSON.stringify(userDetails),
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }).then(res => {
            if(!res.ok){
                throw new Error('Invalid username or password')
            }
            return res.json()
        })
        .then(json => {
            return json.data
        })
        .catch(error => {
            return Promise.reject(error)
        })
    },
    register: userDetails => {
        //console.log("Register SERVICE");
        return fetch('/api/register', {
            method: 'POST',
            body: JSON.stringify(userDetails),
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }).then(res => {
            if(!res.ok){
                throw new Error('Username already taken')
            }
            return res.json()
        })
        .then(json => {
            return json.data
        })
        .catch(error => {
            return Promise.reject(error)
        })
    },
    logout: () => {
        //console.log("Logout SERVICE")
        return fetch('/api/logout', {
            method: 'POST',
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }).then(res => {
            if(!res.ok){
                
            }
            return Promise.resolve()
        })
    },
    isAuthenticated: () => {
        //console.log("Authenticated SERVICE")
        return fetch('/api/authenticated', {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            }
        }).then(res => {
            //console.log(res);
            //console.log(res.status);
            //console.log(res.json());
            if(res.status == 200){
                return res.json().then(data => data);
            }
            else {
                return { isAuthenticated: false, user: '' }
            }
        })
    }
    // isAuthenticated: () => { //Removed the GET because it matches the static file serving
    //     console.log("Authenticated SERVICE")
    //     return fetch('/api/authenticated', {
    //         method: 'GET',
    //         headers: {
    //             'Accept': 'application/json'
    //         }
    //     }).then(res => {
    //         console.log(res);
    //         console.log(res.status);
    //         console.log(res.json());
    //         if(res.status == 200){
    //             return res.json().then(data => data);
    //         }
    //         else {
    //             return { isAuthenticated: false, user: '' }
    //         }
    //     })
    // }
}