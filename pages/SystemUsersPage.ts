import { Locator, Page } from '@playwright/test';

export type UserRole = 'Admin' | 'ESS';
export type UserStatus = 'Enabled' | 'Disabled';

export type UserData = {
    role: UserRole;
    employeeName: string;
    status: UserStatus;
    username: string;
    password: string;
};

export class SystemUsersPage {
    private readonly page: Page;
    readonly systemUsersTitle: Locator;
    readonly editUserTitle: Locator;
    private readonly addButton: Locator;
    private readonly userRoleDropdown: Locator;
    private readonly employeeNameInput: Locator;
    private readonly statusDropdown: Locator;
    private readonly usernameInput: Locator;
    private readonly passwordInput: Locator;
    private readonly confirmPasswordInput: Locator;
    private readonly saveButton: Locator;
    private readonly searchUsername: Locator;
    private readonly searchButton: Locator;
    readonly savedSuccessfullyMessage: Locator;
    readonly usernameRequiredMessage: Locator;

    constructor(page: Page) {
        this.page = page;

        this.systemUsersTitle = page.getByText('System Users', { exact: true });
        this.editUserTitle = page.getByRole('heading', { name: 'Edit User' });
        this.addButton = page.getByRole('button', { name: 'Add' });

        this.userRoleDropdown = page
            .locator('.oxd-input-group')
            .filter({ hasText: 'User Role' })
            .locator('.oxd-select-text');

        this.employeeNameInput = page.getByPlaceholder('Type for hints...');
        this.savedSuccessfullyMessage = page.getByText('Successfully Saved', {
            exact: true,
        });
        this.statusDropdown = page
            .locator('.oxd-input-group')
            .filter({ hasText: 'Status' })
            .locator('.oxd-select-text');

        const usernameInputGroup = page
            .locator('.oxd-input-group')
            .filter({ hasText: 'Username' });

        this.usernameInput = usernameInputGroup.getByRole('textbox');
        this.usernameRequiredMessage = usernameInputGroup.getByText('Required', {
            exact: true,
        });

        this.passwordInput = page
            .locator('.oxd-input-group')
            .filter({ hasText: /^Password/ })
            .locator('input[type="password"]');

        this.confirmPasswordInput = page
            .locator('.oxd-input-group')
            .filter({ hasText: 'Confirm Password' })
            .locator('input[type="password"]');

        this.searchUsername = page
            .locator('.oxd-input-group')
            .filter({ hasText: 'Username' })
            .getByRole('textbox');
        this.searchButton = page.getByRole('button', { name: 'Search' });
        this.saveButton = page.getByRole('button', { name: 'Save' });
    }

    async navigateToSystemUsers(): Promise<void> {
        await this.page.goto('/web/index.php/admin/viewSystemUsers');
        await this.systemUsersTitle.waitFor();
    }

    async createUser(user: UserData): Promise<void> {
        await this.addButton.click();

        await this.fillUserForm(user);
        await this.saveButton.click();
    }

    async attemptToCreateUser(user: UserData): Promise<void> {
        await this.addButton.click();
        await this.fillUserForm(user);
        await this.saveButton.click();
    }

    private async fillUserForm(user: UserData): Promise<void> {

        await this.userRoleDropdown.click();
        await this.page
            .getByRole('option', { name: user.role, exact: true })
            .click();

        await this.employeeNameInput.fill(user.employeeName);
        await this.page
            .getByRole('option', { name: user.employeeName, exact: true })
            .click();

        await this.statusDropdown.click();
        await this.page
            .getByRole('option', { name: user.status, exact: true })
            .click();

        await this.usernameInput.fill(user.username);

        await this.passwordInput.fill(user.password);
        await this.confirmPasswordInput.fill(user.password);
    }

    async findUser(username: string): Promise<void> {
        if (!this.page.url().includes('/admin/viewSystemUsers')) {
            await this.navigateToSystemUsers();
        }

        await this.searchUsername.fill(username);
        await this.searchButton.click();
    }

    getUserRow(username: string): Locator {
        return this.page.locator('.oxd-table-card').filter({
            has: this.page.getByText(username, { exact: true }),
        });
    }

    async openUserForEdit(username: string): Promise<void> {
        const userRow = this.getUserRow(username);

        await userRow
            .locator('button')
            .filter({
                has: this.page.locator('i.bi-pencil-fill')
            })
            .click();
    }

    async updateRoleAndStatus(
        role: UserRole,
        status: UserStatus,
    ): Promise<void> {
        await this.userRoleDropdown.click();
        await this.page
            .getByRole('option', { name: role, exact: true })
            .click();

        await this.statusDropdown.click();
        await this.page.getByRole('option', { name: status, exact: true }).click();

        await this.saveButton.click();
        await this.page.waitForURL(/viewSystemUsers/);
    }

    async deleteUser(username: string): Promise<void> {
        const userRow = this.getUserRow(username);
        await userRow.waitFor({ state: 'visible' });

        await userRow
            .locator('button')
            .filter({
                has: this.page.locator('i.bi-trash'),
            })
            .click();

        const confirmDeleteButton = this.page.getByRole('button', {
            name: 'Yes, Delete',
        });

        await confirmDeleteButton.waitFor({ state: 'visible' });
        await confirmDeleteButton.click();
        await userRow.waitFor({ state: 'detached' });
    }
}
