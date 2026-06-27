import {RouteDefinition} from './route-definition';
export interface RouteMatch{
    route : RouteDefinition;
    params : Record<string,string>;
}

