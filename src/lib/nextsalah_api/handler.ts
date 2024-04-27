import type {
  ILocation,
  IFetchPrayertimes,
  IErrorResponse,
  ApiResponse,
  IListFetchPrayertimes,
  INextSalahAPIResponse,
} from "./interfaces";

class NextSalahAPI {
  private baseUrl: string;

  constructor(endPoint: string) {
    const apiBaseUrl =
      import.meta.env.VITE_API_URL ||
      "https://nextsalah.com/api/v1/prayertimes/";
    this.baseUrl = `${apiBaseUrl}${endPoint.startsWith("/") ? endPoint.slice(1) : endPoint}`;
  }

  async get_all_locations(): Promise<ApiResponse<string[]>> {
    return this.sendHttpRequest<string[]>(`${this.baseUrl}/locations`, "GET");
  }

  async get_location(
    data: ILocation,
  ): Promise<ApiResponse<INextSalahAPIResponse>> {
    const url = new URL(this.baseUrl);
    url.search = new URLSearchParams(data as any).toString(); // Consider defining the types more precisely than 'any'
    return this.sendHttpRequest<INextSalahAPIResponse>(url.toString(), "GET");
  }

  private async sendHttpRequest<T>(
    url: string,
    method: string,
    body?: any,
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : null,
      });

      if (!response.ok) {
        return this.handleError<T>(response); // This will now correctly handle errors.
      }

      const data: T = await response.json();
      return { data }; // Correctly structured ApiResponse
    } catch (error) {
      return { error: { message: "Network Error" } };
    }
  }

  private async handleError<T>(response: Response): Promise<ApiResponse<T>> {
    let errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        const messages = Array.isArray(errorData.detail)
          ? errorData.detail
          : [errorData.detail];
        errorMessage = messages
          .map(
            (m: { msg: string }) =>
              `${m.msg.charAt(0).toUpperCase()}${m.msg.slice(1)}`,
          )
          .join(", ");
      }
    } catch (error) {
      console.error(error);
    }
    return { error: { message: errorMessage } }; // Now returns an ApiResponse
  }
}

export default NextSalahAPI;
