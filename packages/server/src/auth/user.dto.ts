// TODO: In the future this will be replaced by the user model from the
// auth microservice
export interface User {
  id: string;
  projectId: string;
  role: number;
  iat: number;
  exp: number;
  iss: number;
}
