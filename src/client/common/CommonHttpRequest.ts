import fetch, { HeadersInit } from 'node-fetch';

export const CONTENT_TYPE_JSON = "application/json";
export namespace HttpRequest {
    export async function get(url: string, headers: HeadersInit) {
        try {
            let response = await fetch(url, { method: "GET", headers: headers });
            if (!response.ok) {
                throw new Error(`Error! status: ${response.status}`);
            }
            const result = await response.json();
            console.log('result is: ', JSON.stringify(result));
            return result;
        } catch (error) {
            if (error instanceof Error) {
                console.error('error message: ', error);
                return error.message;
            } else {
                console.error('unexpected error: ', error);
                return 'An unexpected error occurred';
            }
        }
    }

    export async function post(url: string, body: any, headers: HeadersInit) : Promise<any>{
        try {
            console.log( "input " + JSON.stringify(body));
            let response = await fetch(url, { method: "POST", body: body, headers: headers });
            console.log(JSON.stringify(response));
            if (!response.ok) {
                throw new Error(`Error! status: ${response.status}`);
            }
            const result = await response.json();
            console.log('result is: ', JSON.stringify(result));
            return result;
        } catch (error) {
            if (error instanceof Error) {
                console.error('error message: ', error.message);
                return error.message;
            } else {
                console.error('unexpected error: ', error);
                return 'An unexpected error occurred';
            }
        }
    }

    export async function deleteRequest(url: string, body: any, headers: HeadersInit) {
        try {
            let response = await fetch(url, { method: "DELETE", body, headers: headers });
            if (!response.ok) {
                throw new Error(`Error! status: ${response.status}`);
            }
            const result = await response.json();
            console.log('result is: ', JSON.stringify(result));
            return result;
        } catch (error) {
            if (error instanceof Error) {
                console.error('error message: ', error.message);
                return error.message;
            } else {
                console.error('unexpected error: ', error);
                return 'An unexpected error occurred';
            }
        }
    }

    export async function putRequest(url: string, body: any, headers: HeadersInit) {
        try {
            let response = await fetch(url, { method: "PUT", body, headers: headers });
            if (!response.ok) {
                throw new Error(`Error! status: ${response.status}`);
            }
            const result = await response.json();
            console.log('result is: ', JSON.stringify(result));
            return result;
        } catch (error) {
            if (error instanceof Error) {
                console.error('error message: ', error.message);
                return error.message;
            } else {
                console.error('unexpected error: ', error);
                return 'An unexpected error occurred';
            }
        }
    }
}
