"use strict";
// Super Admin Account Configuration
// Change these credentials as needed for different environments
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSuperAdminByEmail = exports.isSuperAdminEmail = exports.getSuperAdminPassword = exports.SUPER_ADMIN_PASSWORD = exports.SUPER_ADMIN_ACCOUNTS = void 0;
exports.SUPER_ADMIN_ACCOUNTS = [
    {
        email: 'abdullahusimin1@gmail.com',
        name: 'Abdullah Usimin',
        role: 'super_admin',
        password: '@abdullah1'
    },
    {
        email: 'stv7168@gmail.com',
        name: 'STV Admin',
        role: 'super_admin',
        password: '12345678'
    },
    {
        email: 'abdullahabeer003@gmail.com',
        name: 'Abdullah Abeer',
        role: 'super_admin',
        password: '12345678'
    }
];
// Default password for all super admin accounts
exports.SUPER_ADMIN_PASSWORD = '12345678';
// Update password here and it will be reflected across the application
var getSuperAdminPassword = function () { return exports.SUPER_ADMIN_PASSWORD; };
exports.getSuperAdminPassword = getSuperAdminPassword;
// Check if email is a super admin
var isSuperAdminEmail = function (email) {
    return exports.SUPER_ADMIN_ACCOUNTS.some(function (account) { return account.email === email; });
};
exports.isSuperAdminEmail = isSuperAdminEmail;
// Get super admin by email
var getSuperAdminByEmail = function (email) {
    return exports.SUPER_ADMIN_ACCOUNTS.find(function (account) { return account.email === email; });
};
exports.getSuperAdminByEmail = getSuperAdminByEmail;
