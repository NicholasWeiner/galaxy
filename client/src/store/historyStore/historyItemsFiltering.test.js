import { getFilters, getQueryDict, testFilters } from "./historyItemsFiltering";

const filterTexts = [
    "name='name of item' hid>10 hid<100 create-time>'2021-01-01' update-time<\"2022-01-01\" state=success extension=ext tag=first",
    "name='name of item' hid_gt=10 hid-lt=100 create_time-gt=\"2021-01-01\" update_time-lt='2022-01-01' state=success extension=ext tag=first",
];
describe("historyItemsFiltering", () => {
    test("parse default filter", () => {
        const filters = getFilters("name of item");
        expect(filters[0][0]).toBe("name");
        expect(filters[0][1]).toBe("name of item");
        const queryDict = getQueryDict("name of item");
        expect(queryDict["name-contains"]).toBe("name of item");
    });
    test("parse filter text as entries", () => {
        filterTexts.forEach((filterText) => {
            const filters = getFilters(filterText);
            expect(filters[0][0]).toBe("name");
            expect(filters[0][1]).toBe("name of item");
            expect(filters[1][0]).toBe("hid_gt");
            expect(filters[1][1]).toBe("10");
            expect(filters[2][0]).toBe("hid_lt");
            expect(filters[2][1]).toBe("100");
            expect(filters[3][0]).toBe("create_time_gt");
            expect(filters[3][1]).toBe("2021-01-01");
            expect(filters[4][0]).toBe("update_time_lt");
            expect(filters[4][1]).toBe("2022-01-01");
            expect(filters[5][0]).toBe("state");
            expect(filters[5][1]).toBe("success");
            expect(filters[6][0]).toBe("extension");
            expect(filters[6][1]).toBe("ext");
            expect(filters[7][0]).toBe("tag");
            expect(filters[7][1]).toBe("first");
        });
    });
    test("parse filter text as query dictionary", () => {
        filterTexts.forEach((filterText) => {
            const queryDict = getQueryDict(filterText);
            expect(queryDict["name-contains"]).toBe("name of item");
            expect(queryDict["hid-gt"]).toBe("10");
            expect(queryDict["hid-lt"]).toBe("100");
            expect(queryDict["create_time-gt"]).toBe(1609459200);
            expect(queryDict["update_time-lt"]).toBe(1640995200);
            expect(queryDict["state-eq"]).toBe("success");
            expect(queryDict["extension-eq"]).toBe("ext");
            expect(queryDict["tag"]).toBe("first");
        });
    });
    test("validate filtering of a history item", () => {
        filterTexts.forEach((filterText) => {
            const filters = getFilters(filterText);
            const item = {
                name: "contains the name of item.",
                hid: 11,
                create_time: "2021-06-01",
                update_time: "2021-06-01",
                state: "success",
                extension: "ext",
                tags: ["first", "second"],
            };
            expect(testFilters(filters, { ...item })).toBe(true);
            expect(testFilters(filters, { ...item, hid: 10 })).toBe(false);
            expect(testFilters(filters, { ...item, hid: 100 })).toBe(false);
            expect(testFilters(filters, { ...item, hid: 99 })).toBe(true);
            expect(testFilters(filters, { ...item, state: "error" })).toBe(false);
            expect(testFilters(filters, { ...item, create_time: "2021-01-01" })).toBe(false);
            expect(testFilters(filters, { ...item, create_time: "2021-01-02" })).toBe(true);
            expect(testFilters(filters, { ...item, update_time: "2022-01-01" })).toBe(false);
            expect(testFilters(filters, { ...item, update_time: "2021-12-31" })).toBe(true);
            expect(testFilters(filters, { ...item, tags: ["second"] })).toBe(false);
        });
    });
});
