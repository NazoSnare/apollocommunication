import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "@nativescript/angular";
import { APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { split, ApolloClientOptions, InMemoryCache } from '@apollo/client/core';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { OperationTypeNode } from "graphql";

@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        NativeScriptModule,
        AppRoutingModule
    ],
    declarations: [
        AppComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ],
    providers: [
        {
            provide: APOLLO_OPTIONS,
            useFactory(httpLink: HttpLink): ApolloClientOptions<{}> {
                // Create an http link:
                const http = httpLink.create({
                    uri: 'http://localhost:3000/graphql',
                });

                // Create a WebSocket link:
                const ws = new WebSocketLink({
                    uri: `ws://localhost:5000/`,
                    options: {
                        reconnect: true,
                    },
                });

                interface Definition {
                    kind: string;
                    operation?: OperationTypeNode;
                }

                // using the ability to split links, you can send data to each link
                // depending on what kind of operation is being sent
                const link = split(
                    // split based on operation type
                    ({ query }) => {
                        const { kind, operation }: Definition = getMainDefinition(query);
                        return (
                            kind === 'OperationDefinition' && operation === 'subscription'
                        );
                    },
                    ws,
                    http,
                );

                return {
                    link,
                    cache: new InMemoryCache(),
                    // ... options
                };
            },
            deps: [HttpLink],
        },
    ]
})
export class AppModule { }
