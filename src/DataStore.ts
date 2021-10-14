import { Collection, ObjectId } from "mongodb";
import { SkyMongo } from ".";
import DbData from "./DbData";

export default class DataStore<DT> {

    private collection: Collection;

    constructor(name: string) {
        this.collection = SkyMongo.createCollection(name);
    }

    private cleanData(data: any): any {
        const cleaned = Object.fromEntries(Object.entries(data).filter(([_, v]) => v != null));
        delete cleaned.id;
        delete cleaned._id;
        delete cleaned.createTime;
        delete cleaned.updateTime;
        return cleaned;
    }

    private updateOrders(cleaned: any) {
        let orders: any = {};
        for (const [name, value] of Object.entries(cleaned)) {
            if (name === "$inc") { orders.$inc = value; }
            else if (name === "$push") { orders.$push = value; }
            else if (name === "$addToSet") { orders.$addToSet = value; }
            else if (name === "$pull") { orders.$pull = value; }
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

    public async idExists(_id: number | string): Promise<boolean> {
        return await this.collection.findOne({ _id }) !== undefined;
    }

    public async get(_id: number | string): Promise<(DT & DbData) | undefined> {
        const data: any = await this.collection.findOne({ _id });
        if (data !== undefined) {
            data.id = data._id instanceof ObjectId ? data._id.toHexString() : data._id;
            delete data._id;
            return data;
        }
    }

    public async set(_id: number | string, data: DT) {
        const cleaned = this.cleanData(data);
        if (await this.idExists(_id) !== true) {
            cleaned._id = _id;
            cleaned.createTime = Date.now();
            await this.collection.insertOne(cleaned);
        } else {
            cleaned.updateTime = Date.now();
            await this.collection.updateOne({ _id }, this.updateOrders(cleaned));
        }
    }
}
