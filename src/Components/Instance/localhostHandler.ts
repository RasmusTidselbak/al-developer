import { ServerConfig } from "../../Models/ServerConfig";


export default class{
    public static newInstance(serverConf: ServerConfig){
        const shell = require('node-powershell');
        const os = require('os');
        // Create new Docker Instance
        let ps = new shell({
            executionPolicy: "Bypass",
            noProfile: true
        });

        // ps.addCommand('$env:UserDomain + "\\" + $env:UserName');
        console.log(os.platform());
        console.log(os.release());

        // Check if there is access to docker without admin
        // Run NAV
        ps.addCommand('docker run microsoft/nanoserver');
        ps.invoke().
            then((output:any) => {
                console.log(output);
            }).
            catch((err:any) => {
                console.log(err);
                ps.dispose();
            });

    }

    public static removeInstance(serverConf: ServerConfig){
        // Remove Docker Instance
    }
}