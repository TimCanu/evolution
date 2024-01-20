import { FC } from 'react'
import { Species } from '@/src/models/species.model'
import { usePlayerStatus } from '@/src/hooks/player-status.hook'
import { EVOLVING_STAGES, useGameContext } from '@/src/providers/game.provider'
import { PlusIcon } from '@/src/components/svg-icons/plus-icon'

interface SpeciesSizeElementProps {
    index: number
    species: Species
}

export const SpeciesSizeElement: FC<SpeciesSizeElementProps> = ({ index, species }) => {
    const { isEvolvingStage } = usePlayerStatus()

    const canIncreaseSize = isEvolvingStage() && species.size < 6

    return (
        <>
            {canIncreaseSize ? (
                <IncreaseSpeciesSizeButton index={index} species={species} />
            ) : (
                <IncreaseSpeciesSizeLabel index={index} species={species} />
            )}
        </>
    )
}

const IncreaseSpeciesSizeButton: FC<SpeciesSizeElementProps> = ({ index, species }) => {
    const { updateStatus, updateSelectedSpecies } = useGameContext()

    return (
        <button
            className="relative inline-flex p-1 focus:animate-bounce"
            aria-label={`Increase size of species at position ${index + 1}`}
            onClick={() => {
                updateSelectedSpecies(species)
                updateStatus(EVOLVING_STAGES.INCREMENT_SPECIES_SIZE)
            }}
        >
            <IncreaseSpeciesSizeLabel index={index} species={species} />
            <span className="absolute justify-center w-5 h-5 text-white bg-orange-600 border rounded-full -top-1 -start-0 ml-1">
                <PlusIcon />
            </span>
        </button>
    )
}

const IncreaseSpeciesSizeLabel: FC<SpeciesSizeElementProps> = ({ index, species }) => {
    return (
        <span
            className="border bg-orange-600 rounded-full w-8 h-8 flex justify-center items-center ml-2"
            aria-label={`Species at index ${index} size: ${species.size}`}
        >
            {species.size}
        </span>
    )
}
