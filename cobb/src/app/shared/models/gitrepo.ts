export interface GitRepoDto {
  id: string;
  repositoryName: string;
  repositoryLink: string;
  accessType: string;
  accessToken: string;
  creationDate: Date;
}

export interface CreateGitRepoDto {
  contextId: string | null;
  repositoryName: string;
  repositoryLink: string;
  accessType: string;
  accessToken: string;
  creationDate?: Date;
}
