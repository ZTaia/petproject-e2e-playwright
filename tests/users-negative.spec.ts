import { expect, test } from '@playwright/test';
import { environment } from '../config/environment';
import { LoginPage } from '../pages/LoginPage';
import { SystemUsersPage, UserData } from '../pages/SystemUsersPage';

test.describe('Checking required fields on validation @negative', () => {
    let usersPage: SystemUsersPage;

    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        usersPage = new SystemUsersPage(page);

        await loginPage.goto();
        await loginPage.login(
            environment.adminUsername,
            environment.adminPassword,
        );
        await expect(page).toHaveURL(/dashboard/);

        await usersPage.navigateToSystemUsers();
        await expect(usersPage.systemUsersTitle).toBeVisible();
    });

    test('Returns no user for an unknown username', async () => {
        const unknownUsername = `missing_${Date.now()}`;

        await usersPage.findUser(unknownUsername);

        await expect(usersPage.getUserRow(unknownUsername)).toHaveCount(0);
    });

    test('Requires a username when creating a user', async () => {
        const userWithoutUsername: UserData = {
            role: 'ESS',
            employeeName: environment.employeeName,
            status: 'Enabled',
            username: '',
            password: '123qwe!',
        };

        await usersPage.attemptToCreateUser(userWithoutUsername);

        await expect(usersPage.usernameRequiredMessage).toBeVisible();
    });
});

test('Login with invalid user credentials @negative', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const unknownUsername = `invalid_${Date.now()}`;

    await loginPage.goto();
    await loginPage.login(unknownUsername, 'invalid-password');

    await expect(page).toHaveURL(/auth\/login/);
    await expect(loginPage.loginTitle).toBeVisible();
});
