/* eslint-disable @typescript-eslint/no-explicit-any */
// import { Snackbar } from '@/components/snackbar/Snackbar';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from './api.service';
import type { BaseResponse } from '@/interfaces/base.interface';
// import { useNavigate } from 'react-router';

export const useAxiosInterceptor = () => {
    // const navigate = useNavigate();
    const isValidMessage = (msg: any) => {
        return typeof msg === 'string' && msg.trim().length > 2;
    };

    useEffect(() => {
        const interceptor = api.interceptors.response.use(
            (response) => {
                // console.log(response);

                // if (response.status === 401) {
                //     navigate('/login')
                // }

                if (['post', 'put', 'delete'].includes(response.config.method || '')) {
                    const message: BaseResponse<any> = response.data;
                    if (isValidMessage(message.message)) {
                        toast.success(message.message, {
                            duration: 1500,
                            position: 'top-right'
                        });
                    }
                }
                return response;
            },
            (error) => {
                if (['post', 'put', 'delete'].includes(error.config?.method || '')) {
                    const message = error.response?.data;
                    // console.log(error.response);

                    if (isValidMessage(message?.message)) {
                        toast.error(message.message, {
                            duration: 1500,
                            position: 'top-right'
                        });
                    }
                }
                return Promise.reject(error);
            }
        );

        // Limpia el interceptor al desmontar
        return () => {
            api.interceptors.response.eject(interceptor);
        };
    }, []);

    return null;
}
