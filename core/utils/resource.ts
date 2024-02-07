type NetworkLoadingState = {
    state: "loading";
};
type NetworkFailedState = {
    state: "failed";
    code: number;
};
type NetworkSuccessState<T> = {
    state: "success";
    response: T;
};

type NetworkState<T> = NetworkLoadingState | NetworkFailedState | NetworkSuccessState<T>

const networkLoading : () => NetworkLoadingState = () => {
    return {
        state: "loading"
    };
}

const networkSuccess : <T>(data: T) => NetworkSuccessState<T> = (data) => {
    return {
        state: "success",
        response: data
    };
}

const networkFailed: (code: number) => NetworkFailedState = (code) =>  {
    return {
        state: "failed",
        code
    }
}  


const Factory = {
    createLoading: networkLoading,
    createSuccess: networkSuccess,
    createError: networkFailed
}

export default NetworkState;
export {
    Factory,

}