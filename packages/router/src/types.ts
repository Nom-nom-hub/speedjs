export interface RouteManifest {
  routes: Route[];
}

export interface Route {
  id: string;
  path: string;
  file: string;
  children?: Route[];
  loader?: (args: LoaderArgs) => Promise<any> | any;
  action?: (args: ActionArgs) => Promise<Response> | Response;
}

export interface LoaderArgs {
  request: Request;
  params: Record<string, string>;
}

export interface ActionArgs {
  request: Request;
  params: Record<string, string>;
}

export interface Match {
  route: Route;
  params: Record<string, string>;
}

export interface NavigateOptions {
  replace?: boolean;
  state?: any;
}
