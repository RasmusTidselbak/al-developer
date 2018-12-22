import DockerConfig from "./DockerConfig";
export interface ServerConfig {
    type: string;
    request: string;
    name: string;
    server: string;
    port?: number;
    serverInstance: string;
    authentication: string;
    startupObjectId?: number;
    schemaUpdateMode?: string;
    tenant?: string;
    docker: DockerConfig;
}

export class ServerConfigMethods {
    public static defaultDockerConfig(): ServerConfig {
        return {
            type: "al",
            request: "launch",
            name: "docker",
            server: 'http://localhost',
            authentication: "UserPassword",
            serverInstance: "NAV",
            docker: {
                name: "",
                NAVVersion: "bcsandbox",
                local: "dk",
                username: "admin",
                password: "",
            }

        };
    }
}