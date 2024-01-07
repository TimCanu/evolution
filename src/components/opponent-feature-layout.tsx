import { FC, useState } from 'react'
import { Feature } from '@/src/models/feature.model'

interface OpponentFeatureLayoutProps {
    feature: Feature
}

export const OpponentFeatureLayout: FC<OpponentFeatureLayoutProps> = ({ feature }) => {
    const [collapsed, setCollapsed] = useState(true)

    const toggleIcon = () => {
        setCollapsed(!collapsed)
    }

    return <div className="border border-indigo-600 w-36 max-w-36">
        <div className="flex justify-center">
            {feature.name}
            {collapsed ?
                <button onClick={toggleIcon}
                        className="expand-collapse-icon self-center"></button>
                : <button onClick={toggleIcon}
                          className="collapsed expand-collapse-icon self-center"></button>
            }
        </div>
        {
            !collapsed &&
            <div className="text-xs max-w-36">{feature.description}</div>
        }
    </div>

}
