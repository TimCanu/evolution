import { expect, Page } from '@playwright/test'

export const assertNumberOfHiddenFood = async (page: Page, numberHiddenFoods: number): Promise<void> => {
    await expect(page.getByTestId(/hidden-food-*/)).toHaveCount(numberHiddenFoods)
}
