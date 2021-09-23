"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const _1 = require(".");
class DataStore {
    constructor(name) {
        this.collection = _1.SkyMongo.createCollection(name);
    }
    cleanData(data) {
        const cleaned = Object.fromEntries(Object.entries(data).filter(([_, v]) => v != null));
        delete cleaned.id;
        delete cleaned._id;
        delete cleaned.createTime;
        delete cleaned.updateTime;
        return cleaned;
    }
    updateOrders(cleaned) {
        let orders = {};
        for (const [name, value] of Object.entries(cleaned)) {
            if (name === "$inc") {
                orders.$inc = value;
            }
            else if (name === "$push") {
                orders.$push = value;
            }
            else if (name === "$addToSet") {
                orders.$addToSet = value;
            }
            else if (name === "$pull") {
                orders.$pull = value;
            }
            else if (value === null) {
                if (orders.$unset === undefined) {
                    orders.$unset = {};
                }
                orders.$unset[name] = "";
            }
            else if (name[0] !== "$") {
                if (orders.$set === undefined) {
                    orders.$set = {};
                }
                orders.$set[name] = value;
            }
        }
        return orders;
    }
    async idExists(_id) {
        return await this.collection.findOne({ _id }) !== null;
    }
    async get(_id) {
        const data = await this.collection.findOne({ _id });
        if (data === null) {
            return undefined;
        }
        else {
            data.id = data._id instanceof mongodb_1.ObjectId ? data._id.toHexString() : data._id;
            delete data._id;
            return data;
        }
    }
    async set(_id, data) {
        const cleaned = this.cleanData(data);
        if (await this.idExists(_id) !== true) {
            cleaned._id = _id;
            cleaned.createTime = Date.now();
            await this.collection.insertOne(cleaned);
        }
        else {
            cleaned.updateTime = Date.now();
            await this.collection.updateOne({ _id }, this.updateOrders(cleaned));
        }
    }
}
exports.default = DataStore;
//# sourceMappingURL=DataStore.js.map