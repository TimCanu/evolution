import {FC} from "react";

interface OpponentLayoutProps {
    name: string
}

export const OpponentLayout: FC<OpponentLayoutProps> = ({ name }) => {
    return (
        <div className="border border-indigo-600 w-80 h-44 ml-5">
            {name}
        </div>
    )
}
