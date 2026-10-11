export function isAdmin(user) {
  if (!user) return false
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL
  if (!adminEmail) return false
  return user.email?.toLowerCase() === adminEmail.toLowerCase()
}
