import { Loading } from "./Loading"

export const ScreenLoader = () => {
    return (
        <div className=' bg-gray-800 opacity-80 absolute top-0 left-0 z-50 w-screen h-screen overflow-hidden flex items-center justify-center'>
            <Loading></Loading>
        </div>
    )
}