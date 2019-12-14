#!/usr/bin/env node

import fs from "fs-extra";
import {join} from "path";
import {generateRecordTypesClass, RecordTypesGenOptions} from "./gen/apex/record-types";

interface PackageJsonDef {
    sourceGen?: {
        recordTypes?: RecordTypesGenOptions;
    };
}

type Operation = "record-types";

export function main(args: string[]): void {
    const op: string = args[0];
    const operation: Operation | undefined = parseOperationFromArg(op);
    if (!operation) {
        throw Error(`Unknown operation: ${op}`);
    }
    if (operation === "record-types") {
        const packageJson: PackageJsonDef = JSON.parse(fs.readFileSync(join("package.json")).toString());
        generateRecordTypesClass(packageJson.sourceGen?.recordTypes);
    }
}

function parseOperationFromArg(arg: string): Operation | undefined {
    if (arg === "record-types") {
        return "record-types";
    }
    return undefined;
}

main(process.argv.slice(2));
