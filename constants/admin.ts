/**
 * Admin Configuration
 * 
 * This file contains the list of admin emails who have access to the admin panel.
 * To add or remove admin access, simply update the ADMIN_EMAILS array below.
 */

export const ADMIN_EMAILS = [
    'nhuongggh@gmail.com',
    'sheetappai@gmail.com',
    'bimvietsolutions@gmail.com',
] as const

/**
 * Check if a given email has admin privileges
 * @param email - The email address to check
 * @returns true if the email is in the admin list, false otherwise
 */
export const isAdmin = (email: string | undefined | null): boolean => {
    if (!email) return false
    const cleanEmail = email.trim().toLowerCase()
    const isAdminUser = (ADMIN_EMAILS as readonly string[]).some(e => e.trim().toLowerCase() === cleanEmail)
    console.log(`Checking admin access for: [${cleanEmail}]. Result: ${isAdminUser}`)
    return isAdminUser
}

/**
 * Get the total number of admin users
 */
export const getAdminCount = (): number => {
    return ADMIN_EMAILS.length
}
