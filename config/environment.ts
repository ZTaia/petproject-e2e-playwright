const environmentValue = (name: string, fallback: string): string =>
    process.env[name] ?? fallback;

export const environment = {
    baseURL: environmentValue(
        'BASE_URL',
        'https://opensource-demo.orangehrmlive.com/',
    ),
    adminUsername: environmentValue('ADMIN_USERNAME', 'Admin'),
    adminPassword: environmentValue('ADMIN_PASSWORD', 'admin123'),
    employeeName: environmentValue('EMPLOYEE_NAME', 'Timothy Lewis Amiano'),
} as const;
