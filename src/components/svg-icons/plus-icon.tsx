import { FC } from 'react'

interface PlusIconProps {
    ariaLabel: string
}

export const PlusIcon: FC<PlusIconProps> = ({ariaLabel}) => {
    return (
        <svg role="img" aria-label={ariaLabel} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" strokeWidth="2.4">
            <g id="SVGRepo_bgCarrier" strokeWidth="0" />
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
            <g id="SVGRepo_iconCarrier">
                <path d="M12 6V18" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 12H18" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
            </g>
        </svg>
    )
}
