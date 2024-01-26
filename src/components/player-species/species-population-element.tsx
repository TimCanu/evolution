import { FC } from 'react'
import { Species } from '@/src/models/species.model'
import { usePlayerStatus } from '@/src/hooks/player-status.hook'
import { EVOLVING_STAGES, useGameContext } from '@/src/providers/game.provider'
import { PlusIcon } from '@/src/components/svg-icons/plus-icon'

interface SpeciesPopulationElementProps {
    index: number
    species: Species
}

export const SpeciesPopulationElement: FC<SpeciesPopulationElementProps> = ({ index, species }) => {
    const { isEvolvingStage } = usePlayerStatus()

    const canIncreasePopulation = isEvolvingStage() && species.population < 6

    return (
        <>
            {canIncreasePopulation ? (
                <IncreaseSpeciesPopulationButton index={index} species={species} />
            ) : (
                <IncreaseSpeciesPopulationLabel species={species} index={index} />
            )}
        </>
    )
}

const IncreaseSpeciesPopulationButton: FC<SpeciesPopulationElementProps> = ({ index, species }) => {
    const { updateStatus, updateSelectedSpecies, status, selectedSpecies } = useGameContext()

    const isAnimated =
        selectedSpecies && status === EVOLVING_STAGES.INCREMENT_SPECIES_POPULATION && selectedSpecies.id === species.id

    return (
        <button
            type="button"
            className={`relative p-1 ${isAnimated ? 'animate-bounce' : ''}`}
            onClick={() => {
                updateSelectedSpecies(species)
                updateStatus(EVOLVING_STAGES.INCREMENT_SPECIES_POPULATION)
            }}
        >
            <IncreaseSpeciesPopulationLabel species={species} index={index} />
            <span className="absolute justify-center w-5 h-5 text-white bg-green-600 border rounded-full -top-1 -end-0 mr-1">
                <PlusIcon ariaLabel={`Increase population of species at position ${index + 1}`}/>
            </span>
        </button>
    )
}

const IncreaseSpeciesPopulationLabel: FC<SpeciesPopulationElementProps> = ({ index, species }) => {
    return (
        <span
            className="border bg-green-600 rounded-full w-8 h-8 flex justify-center items-center mr-2"
            aria-label={`Species at index ${index} population: ${species.population}`}
        >
            {species.population}
        </span>
    )
}
