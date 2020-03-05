#!/usr/bin/env node

/* tslint:disable */

import {run} from "@oclif/command";

run()
    .then(require("@oclif/command/flush"))
    // @ts-ignore
    .catch(require("@oclif/errors/handle"));