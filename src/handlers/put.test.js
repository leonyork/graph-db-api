const { put } = require('../repository')

jest.mock('../repository');

const handler = require('./put').handler;

describe("put handler", () => {
    it("should call the user repository with the id from the path parameters and return the content", async() => {
        const mockResponse = { id: 1, content: `{"name":"test"}` };
        put.mockResolvedValue(mockResponse);

        const event = { pathParameters: { type: "user" }, body: mockResponse.content };
        const actualResponse = await handler(event, null);

        expect(put).toHaveBeenCalledWith(event.pathParameters.type, event.pathParameters.id, JSON.parse(event.body));
        expect(actualResponse.body).toEqual(JSON.stringify(mockResponse));
        expect(actualResponse.statusCode).toEqual(200);
    });

    it("should return a 400 if the body cannot be parsed", async() => {
        const event = { pathParameters: { type: "user" }, body: 'not json' };
        const actualResponse = await handler(event, null);

        expect(actualResponse.statusCode).toEqual(400);
    });

    it("should return 400 if any error is thrown by the repository", async() => {
        put.mockImplementation(() => { throw {}; })

        const event = { pathParameters: { type: "user" } };
        const actualResponse = await handler(event, null);

        expect(actualResponse.statusCode).toEqual(400);
    });

    it("should return 404 if an invalid type is given", async() => {
        const event = { pathParameters: { type: "'sqlinjectattack'" }, body: `{"name":"test"}` };
        const actualResponse = await handler(event, null);

        expect(actualResponse.statusCode).toEqual(404);
        //Don't respond with anything dodgy that the client has supplied in case it's CSRF
        expect(actualResponse.body).not.toContain("'sqlinjectattack'");
    });
});