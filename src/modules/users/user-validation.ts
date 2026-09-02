export enum UserGender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other',
}

export enum UserMaritalStatus {
  NEVER_MARRIED = 'Never Married',
  CURRENTLY_MARRIED = 'Currently Married',
  WIDOW_OR_WIDOWER = 'Widow / Widower',
  DIVORCED = 'Divorced',
  SEPARATED = 'Separated',
}

export const PHONE_PATTERN = /^$|^\d{10}$/;
export const YEAR_OF_PASSING_PATTERN = /^$|^(?:19|20)\d{2}$/;