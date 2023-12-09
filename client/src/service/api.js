/* eslint-disable no-unused-vars */
import axios from 'axios';

import { API_NOTIFICATION_MESSAGES, SERVICE_URLS } from '../constants/config';
import { getAccessToken, getRefreshToken, setAccessToken, getType } from '../utils/common-utils';

const API_URL = 'https://react-backend1-9q7t.onrender.com';

const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    function (config) {
        if (config.TYPE.params) {
            config.params = config.TYPE.params;
        } else if (config.TYPE.query) {
            config.url = `${config.url}/${config.TYPE.query}`;
        }
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    function (response) {
        // Stop global loader here
        return processResponse(response);
    },
    function (error) {
        // Stop global loader here
        return Promise.reject(ProcessError(error));
    }
);

function processResponse(response) {
    if (response?.status >= 200 && response?.status < 300) {
        return { isSuccess: true, data: response.data };
    } else {
        return {
            isFailure: true,
            status: response?.status,
            msg: response?.msg,
            code: response?.code,
        };
    }
}

async function ProcessError(error) {
    if (error.response) {
        if (error.response?.status === 403) {
            // Handle refresh token logic if needed
            sessionStorage.clear();
        } else {
            console.log('ERROR IN RESPONSE: ', error);
            return {
                isError: true,
                msg: API_NOTIFICATION_MESSAGES.responseFailure,
                code: error.response.status,
            };
        }
    } else if (error.request) {
        // The request was made but no response was received
        console.log('ERROR IN RESPONSE: ', error);
        return {
            isError: true,
            msg: API_NOTIFICATION_MESSAGES.requestFailure,
            code: '',
        };
    } else {
        // Something happened in setting up the request that triggered an Error
        console.log('ERROR IN RESPONSE: ', error);
        return {
            isError: true,
            msg: API_NOTIFICATION_MESSAGES.networkError,
            code: '',
        };
    }
}

const API = {};

const createAxiosConfig = (url, method, body, responseType, showUploadProgress, showDownloadProgress) => {
    const config = {
        method,
        url,
        data: method === 'DELETE' ? '' : body,
        responseType,
        headers: {
            Authorization: getAccessToken(),
        },
        TYPE: getType({ method }, body),
        onUploadProgress: function (progressEvent) {
            if (showUploadProgress) {
                let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                showUploadProgress(percentCompleted);
            }
        },
        onDownloadProgress: function (progressEvent) {
            if (showDownloadProgress) {
                let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                showDownloadProgress(percentCompleted);
            }
        },
    };

    return config;
};

for (const [key, value] of Object.entries(SERVICE_URLS)) {
    API[key] = (body, showUploadProgress, showDownloadProgress) =>
        axiosInstance(createAxiosConfig(value.url, value.method, body, value.responseType, showUploadProgress, showDownloadProgress));
}

export { API };
