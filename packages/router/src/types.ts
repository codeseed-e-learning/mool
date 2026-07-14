import {RouteDefinition} from './route-definition.js';
export interface RouteMatch{
    route : RouteDefinition;
    params : Record<string,string>;
}

