import DbData from "./DbData";
export default class DataStore<DT> {
    private collection;
    constructor(name: string);
    private cleanData;
    private updateOrders;
    idExists(_id: number | string): Promise<boolean>;
    get(_id: number | string): Promise<(DT & DbData) | undefined>;
    set(_id: number | string, data: DT): Promise<void>;
}
//# sourceMappingURL=DataStore.d.ts.map