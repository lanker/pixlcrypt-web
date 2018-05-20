import axios from 'axios'
import Utils from './utils.js';

class Auth {

    isSignedIn() {
        return this.getToken() != null && this.getRefreshToken() != null;
    }

    getToken() {
        return localStorage.getItem("access_token");
    }

    getRefreshToken() {
        return localStorage.getItem("refresh_token");
    }

    getIdToken() {
        return localStorage.getItem("id_token");
    }

    getBaseUri() {
        return window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
    }

    getRedirectUri() {
        return this.getBaseUri() + "/auth";
    }

    getClientId() {
        return "542fu8i4nfb4eckn95j4uek1m6";
    }

    parseCode() {
        return Utils.getParameterByName("code");
    }

    getTokensAsync(code) {
        return new Promise((resolve, reject) => {
            const uri = "https://pixlcrypt.auth.eu-west-1.amazoncognito.com/oauth2/token";
            const conf = {
                headers: {"Content-Type": "application/x-www-form-urlencoded"}
            };
            const params = new URLSearchParams('grant_type=authorization_code&client_id=' + this.getClientId() + '&redirect_uri=' + this.getRedirectUri() + '&code=' + (code ? code : this.getCode()));
            axios.post(uri, params, conf).then(res => {
                localStorage.setItem('refresh_token', res.data.refresh_token);
                localStorage.setItem('access_token', res.data.access_token);
                localStorage.setItem('id_token', res.data.id_token);
                resolve();
            }).catch(err => {
                reject(err);
            });
        });
    }
}

export default Auth;
