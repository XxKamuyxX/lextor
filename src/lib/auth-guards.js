export function mustChangePassword(user) {
  return user?.user_metadata?.must_change_password === true;
}
