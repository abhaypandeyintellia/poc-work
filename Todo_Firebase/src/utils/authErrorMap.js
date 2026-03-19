export function getAuthErrorMessage(error) {
  switch (error.code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Incorrect email or password";

    case "auth/user-not-found":
      return "Account does not exist";

    case "auth/invalid-email":
      return "Invalid email format";

    case "auth/too-many-requests":
      return "Too many attempts. Try again later";

    default:
      return "Login failed. Try again";
  }
}
