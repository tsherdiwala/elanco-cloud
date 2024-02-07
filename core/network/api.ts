import axios, {isCancel, AxiosError} from 'axios';

const instance = axios.create({
    baseURL: 'https://engineering-task.elancoapps.com/api/',
    timeout: 10000,
  });

export class Api {

    async getApplications<T>() : Promise<T> {
        const d = await instance.get<T>("applications");
        return d.data;
    }

    async getApplicationDetail<T>(name: string): Promise<T> {
        const d = await instance.get<T>(`applications/${name}`)
        return d.data;
    }

}

const api : Api = new Api();

export default api;