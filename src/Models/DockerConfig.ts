export default interface DockerConfig {
    
    name: string;
    username: string;
    password: string;
    sqlconnection: string;
    files?: string;
    webclient: string;
    soap?: number;
    odata?: number;
    clientport?: number;
    devport?: number;
    owner?: string;
    backup?: string;
    image?: string;
}
