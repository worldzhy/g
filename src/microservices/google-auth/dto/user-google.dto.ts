export class UserGoogleDto {
  displayName: string;
  emails: {
    value: string;
    verified: boolean;
  }[];
  id: string;
  name: {familyName: string; givenName: string};
  photos: {value: string}[];
  provider: 'google';
}

export class UserGoogleRes {
  id: string;
  email: string;
  picture: string;
  provider: 'google';
  displayName: string;
}
