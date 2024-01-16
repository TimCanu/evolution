import { FC, useState } from 'react'
import { Feature } from '@/src/models/feature.model'

interface OpponentFeatureLayoutProps {
    feature: Feature
    index: number
    opponentIndex: number
    speciesIndex: number
}

export const OpponentFeatureLayout: FC<OpponentFeatureLayoutProps> = ({
    feature,
    index,
    speciesIndex,
    opponentIndex,
}) => {
    const [collapsed, setCollapsed] = useState(true)

    const toggleIcon = () => {
        setCollapsed(!collapsed)
    }

    return (
        <li className="border border-indigo-600 w-36 max-w-36">
            <div className="flex justify-center">
                <p
                    aria-label={`Name of feature at index ${index} of opponent at index ${opponentIndex} of species at index ${speciesIndex}: ${feature.name}`}
                >
                    {feature.name}
                </p>
                <button
                    aria-hidden={true}
                    onClick={toggleIcon}
                    className={`${collapsed ? '' : 'collapsed'} expand-collapse-icon self-center`}
                ></button>
            </div>
            {!collapsed && (
                <p
                    aria-label={`Description of feature at index ${index} of opponent at index ${opponentIndex} of species at index ${speciesIndex}: ${feature.description}`}
                    className="text-xs max-w-36"
                >
                    {feature.description}
                </p>
            )}
        </li>
    )
}
