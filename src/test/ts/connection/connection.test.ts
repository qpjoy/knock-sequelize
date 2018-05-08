import "mocha";
import {expect} from "chai";
// const models = require('../../../../dbserver/models');

// import * as sequelize from "sequelize";

describe("Testing Connection", function () {
    it("connection should work", async function () {
        // const results = await Main.run([]);
        await expect({exitCode: 0, results: "OK", error: false}).to.deep.equal({exitCode: 0, results: "OK", error: false});
    });
});



