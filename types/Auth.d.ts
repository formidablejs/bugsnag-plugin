export class Auth {
    /**
    @param {FormRequest|Request} request
    */
    isAuthenticated(request: FormRequest | Request): any;
    /**
    @param {FormRequest|Request} request
    */
    getPersonalAccessToken(request: FormRequest | Request): any;
    /**
    @param {FormRequest|Request} request
    */
    get(request: FormRequest | Request): Promise<any>;
}
