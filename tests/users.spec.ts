import { test, expect } from '@playwright/test';
import { environment } from '../config/environment';
import { LoginPage } from '../pages/LoginPage';
import { SystemUsersPage, UserData } from '../pages/SystemUsersPage';

const username = `Taisia_${Date.now()}`;

const user: UserData = {
    role: 'Admin',
    employeeName: environment.employeeName,
    status: 'Enabled',
    username,
    password: '123qwe!',
} as const;

test('Admin manages system user', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const usersPage = new SystemUsersPage(page);
    let userCreated = false;
    let userDeleted = false;

    try {
        await test.step('Login as Admin', async () => {
            await loginPage.goto();
            await loginPage.login(
                environment.adminUsername,
                environment.adminPassword,
            );

            await expect(page).toHaveURL(/dashboard/);
        });

        await test.step('Navigate to System Users page', async () => {
            await usersPage.navigateToSystemUsers();

            await expect(usersPage.systemUsersTitle).toBeVisible();
        });

        await test.step('Create a new user', async () => {
            await usersPage.createUser(user);
            userCreated = true;

            await expect(usersPage.savedSuccessfullyMessage).toBeVisible();
        });

        await test.step('Find created user', async () => {
            await usersPage.findUser(user.username);

            await expect(page).toHaveURL(/viewSystemUsers/);
            await expect(usersPage.getUserRow(user.username)).toContainText(
                user.username,
            );
        });

        await test.step('Edit the user role and status', async () => {
            await usersPage.openUserForEdit(user.username);

            await expect(usersPage.editUserTitle).toBeVisible();

            await usersPage.updateRoleAndStatus('ESS', 'Disabled');
        });

        await test.step('Verify that the user was updated', async () => {
            await usersPage.findUser(user.username);

            const userRow = usersPage.getUserRow(user.username);
            await expect(userRow).toContainText(user.username);
            await expect(userRow).toContainText('ESS');
            await expect(userRow).toContainText('Disabled');
        });

        await test.step('Delete the user', async () => {
            await usersPage.deleteUser(user.username);
            userDeleted = true;
        });

        await test.step('Verify that the user was deleted', async () => {
            await usersPage.findUser(user.username);
            await expect(usersPage.getUserRow(user.username)).toHaveCount(0);
        });
    } finally {
        if (userCreated && !userDeleted && !page.isClosed()) {
            try {
                await test.step('Clean up the created user after failure', async () => {
                    await usersPage.findUser(user.username);

                    if ((await usersPage.getUserRow(user.username).count()) > 0) {
                        await usersPage.deleteUser(user.username);
                    }
                });
            } catch (cleanupError) {
                console.warn('Best-effort user cleanup failed:', cleanupError);
            }
        }
    }
});
