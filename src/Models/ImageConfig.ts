export default class{
    
    public constructor(version: string, cu: string|undefined, local: string|undefined){
        this.version = version;
        this.cu = cu;
        this.local = local;
    }

    public version: string = "bcsandbox";
    public cu?: string;
    public local?: string;

    /**
     * GetImageName
     */
    public GetImageName():string {
        return "mcr.microsoft.com/businesscentral/sandbox:us"; 
    }

}