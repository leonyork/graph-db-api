const { get } = require('../repository')

jest.mock('../repository');

const handler = require('./get').handler;

describe("get handler", () => {
    it("should call the user repository with the id from the path parameters and return the content", async() => {
        const mockResponse = { id: 1, content: "test" };
        get.mockResolvedValue(mockResponse);

        const event = { pathParameters: { type: "user", id: 1 } };
        const actualResponse = await handler(event, null);

        expect(get).toHaveBeenCalledWith(event.pathParameters.type, event.pathParameters.id);
        expect(actualResponse.body).toEqual(JSON.stringify(mockResponse));
        expect(actualResponse.statusCode).toEqual(200);
    });

    it("should return a 404 if the repository returns an undefined value is returned from the respository", async() => {
        const mockResponse = undefined;
        get.mockResolvedValue(mockResponse);

        const event = { pathParameters: { type: "user", id: 1 } };
        const actualResponse = await handler(event, null);

        expect(actualResponse.statusCode).toEqual(404);
    });

    it("should return 500 if any error is thrown by the repository", async() => {
        get.mockImplementation(() => { throw {}; })

        const event = { pathParameters: { type: "user", id: 1 } };
        const actualResponse = await handler(event, null);

        expect(actualResponse.statusCode).toEqual(500);
        expect(actualResponse.body).toContain("user");
    });

    it("should return 404 if an invalid type is given", async() => {
        const event = { pathParameters: { type: "'sql-inject-attack'", id: 1 } };
        const actualResponse = await handler(event, null);

        expect(actualResponse.statusCode).toEqual(404);
        //Don't respond with anything dodgy that the client has supplied in case it's CSRF
        expect(actualResponse.body).not.toContain("'sql-inject-attack'");
    });
});