import { expect, test } from '@playwright/test'

test('has button to redirect to create game page', async ({ page }) => {
    await page.goto('http://localhost:3000/')

    await page.getByRole('link', { name: 'Create a game' }).click()

    await expect(page).toHaveURL('http://localhost:3000/games/create')
})

test('has button to redirect to join game page', async ({ page }) => {
    await page.goto('http://localhost:3000/')

    await page.getByRole('link', { name: 'Join a game' }).click()

    await expect(page).toHaveURL('http://localhost:3000/games/join')
})