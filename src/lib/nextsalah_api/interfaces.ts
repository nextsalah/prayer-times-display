export type SingleOptionLocation = string[];

interface VaktijaEUData {
  name: string;
  slug: string;
  country: {
    id: number;
    title: string;
    short_code: string;
  };
}

export interface VaktijaEULocations {
  data: VaktijaEUData[];
}

export interface ISingleOptionProps extends ISourceInfo {
  select_label: string;
  selected_key: string;
  option_by_index: boolean;
}

export interface ISourceInfo {
  source_name: string;
  source_logo_src: string;
  source_link: string;
  end_point: string;
}

export interface IClientHandler {
  handleData: <T>(locations: T) => void | Promise<void>;
  formValid?: () => boolean;
}

export interface IFormHandlerProps {
  fetchFinished?: boolean;
  error?: string;
}

export interface IFormData extends ISourceInfo, IClientHandler {}

export interface ILocation {
  city: string;
  country: string;
  [key: string]: string | number | boolean;
}

export interface IFetchPrayertimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  date: string;
}
export type IListFetchPrayertimes = IFetchPrayertimes[];
export interface INextSalahAPIResponse {
  success: boolean;
  prayertimes: IListFetchPrayertimes;
}

export interface IErrorResponse {
  message: string;
  statusCode?: number; // Optional, for more detailed error handling
}

export interface ApiResponse<T> {
  data?: T;
  error?: IErrorResponse;
}
