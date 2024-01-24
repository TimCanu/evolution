import { expect, Page } from '@playwright/test'

export const assertNumberOfHiddenFood = async (page: Page, numberOfHiddenFoods: number): Promise<void> => {
    await expect(page.getByTestId(/hidden-food-*/)).toHaveCount(numberOfHiddenFoods)
}

export const assertNumberOfFoodInWaterPlan = async (page: Page, numberOfFoods: number): Promise<void> => {
    await expect(page.getByRole('img', { name: `Number of food on the food area: ${numberOfFoods}`})).toBeVisible()
}
