export default class{
    
    public constructor(version: string, cu: string|undefined, local: string|undefined){
        this.version = version;
        this.cu = cu;
        this.local = local;
    }

    public version: string = "BC";
    public cu?: string;
    public local?: string;

    /**
     * GetImageName
     */
    public GetImageName():string {
        let imageName: string;
        let tagBegan: boolean = false;
        if (this.version.toUpperCase() === 'BC') {
            imageName = "mcr.microsoft.com/businesscentral/sandbox";
        } else {
            imageName = "microsoft/dynamics-nav:" + this.version;
            tagBegan = true;
        }

        if(this.cu !== "" && this.cu !== undefined && this.cu !== "0"){
            imageName += tagBegan ? "-" : ":";
            imageName += "cu" + this.cu;

            tagBegan = true;
        }

        if(this.local !== "" && this.local !== undefined){
            imageName += tagBegan ? "-" : ":";
            imageName += this.local;
        }

        return imageName;
    }

}