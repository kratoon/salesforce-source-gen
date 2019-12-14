
import fs from "fs-extra";
import {join} from "path";

export function loadProject(projectDir: string = "."): Project {
    return new Project(projectDir);
}

export class Project {

    public get exists(): boolean {
        return exists(this.path);
    }

    public get isDx(): boolean {
        return exists(this.sfdxProjectConfigPath);
    }

    constructor(public readonly path: string) {
    }

    public join(...args: string[]): string {
        return join(this.path, ...args);
    }

    public get sfdxProjectConfigPath(): string {
        return join(this.path, "sfdx-project.json");
    }

    public get sfdxProjectConfig(): any {
        if (!this.isDx) {
            throw Error(`Not a DX project: ${this.path}`);
        }
        const configPath: string = this.sfdxProjectConfigPath;
        const projectConfig: Buffer = fs.readFileSync(configPath);
        try {
            return JSON.parse(projectConfig.toString());
        } catch (e) {
            console.error(e);
            throw Error(`Failed to parse project config: ${configPath}`);
        }
    }

    public get sourceApiVersion(): string {
        const projectConfig: any = this.sfdxProjectConfig;
        try {
            return projectConfig.sourceApiVersion;
        } catch (e) {
            console.error(e);
            throw Error(`Source API version not found: ${this.sfdxProjectConfigPath}`);
        }
    }

    public get sfdxDefaultProjectDirectory(): string {
        const projectConfig: any = this.sfdxProjectConfig;
        try {
            if (projectConfig.packageDirectories.length === 1) {
                return projectConfig.packageDirectories[0].path;
            }
            return projectConfig.packageDirectories.filter((it: any) => it.default)[0];
        } catch (e) {
            console.error(e);
            throw Error(`No default package directory found: ${this.sfdxProjectConfigPath}`);
        }
    }
}

function exists(file: string): boolean {
    try {
        fs.statSync(file);
    } catch (e) {
        return false;
    }
    return true;
}
