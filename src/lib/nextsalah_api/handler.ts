import type {
  ILocation,
  IFetchPrayertimes,
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
    url.search = new URLSearchParams(data as any).toString();
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
        return this.handleError<T>(response);
      }

      const data: T = await response.json();
      return { data };
    } catch (error: any) {
      // Improved error messages for common network errors
      if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
        return {
          error: {
            message: "Network connection error. Please check your internet connection.",
            status: 0,
            code: "0"
          }
        };
      }
      
      return { 
        error: { 
          message: error.message || "An unexpected error occurred",
          status: 0,
          code: '0'
        } 
      };
    }
  }

  private async handleError<T>(response: Response): Promise<ApiResponse<T>> {
    let errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
    
    try {
      // Parse error response if it's JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        
        // Handle FastAPI style errors
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail
              .map((m: { msg: string; loc?: string[] }) => {
                const location = m.loc ? ` at ${m.loc.join('.')}` : '';
                return `${m.msg.charAt(0).toUpperCase()}${m.msg.slice(1)}${location}`;
              })
              .join(", ");
          } else if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else {
            errorMessage = JSON.stringify(errorData.detail);
          }
        }
        
        // Handle other common API error formats
        if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        if (errorData.error) {
          if (typeof errorData.error === 'string') {
            errorMessage = errorData.error;
          } else if (errorData.error.message) {
            errorMessage = errorData.error.message;
          }
        }
      }
    } catch (error) {
      // If parsing fails, use the original HTTP error message
      console.error("Error parsing error response:", error);
    }
    
    // Provide user-friendly messages for common HTTP status codes
    const statusMessages: Record<number, string> = {
      400: "Bad request: The server couldn't understand the request",
      401: "Authentication required. Please log in again",
      403: "You don't have permission to access this resource",
      404: "The requested resource was not found",
      429: "Too many requests. Please try again later",
      500: "Server error. Please try again later",
      502: "Bad gateway. Please try again later",
      503: "Service unavailable. Please try again later",
      504: "Gateway timeout. Please try again later"
    };
    
    if (response.status in statusMessages && !errorMessage.includes(String(response.status))) {
      errorMessage = statusMessages[response.status];
    }
    
    return {
      error: {
        message: errorMessage,
        status: response.status,
        code: response.status.toString()
      }
    };
  }
}

export default NextSalahAPI;