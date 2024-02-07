import { useParams } from "react-router-dom";

export interface RouterWrapperProps<T> {
    builder: (params: T) => JSX.Element
}

const RouterWrapper= <T>(props : RouterWrapperProps<T>) => {
    const params = useParams();
    return props.builder(useParams() as T);
}

export { RouterWrapper }