import {FC} from "react";

interface CardProps {
    name: string
    description: string
    foodNumber: number
}

export const CardLayout: FC<CardProps> = ({name, description, foodNumber}) => {
    return (
        <div className="border border-indigo-600 w-64 h-64 ml-5 flex flex-col">
            <span className="mb-auto">
                {name}
            </span>
            <span>
                {description}
            </span>
            <span className="self-end border border-indigo-600 rounded-full w-8 h-8 flex justify-center items-center">
                {foodNumber}
            </span>
        </div>
    )
}
