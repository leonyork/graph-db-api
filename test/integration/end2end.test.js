const request = require('supertest');
if (!process.env.USER_STORE_API_SECURED_TEST_URL) {
    require('./helper/services');
} else {
    jest.setTimeout(10000);
}
const requestUserApi = () => request(process.env.USER_STORE_API_SECURED_TEST_URL);

describe('User API', () => {
    it('should return 404 when getting a non-existant user', async() => {
        try {
            requestUserApi().get(`/user/1`) || fail("Should have been 404");
        } catch (err) {
            expect(err.statusCode).toEqual(404);
        }
    });

    it('should store information against a user', async() => {
        const userInfo = JSON.stringify({ name: "test" });
        await requestUserApi().put(`/user/2`).send(userInfo).expect(200);

        const response = await requestUserApi().get(`/user/2`);
        expect(response.text).toEqual(userInfo);
    });

    it('should update existing information stored against a user', async() => {
        const userInfo1 = JSON.stringify({ name: "test1" });
        const userInfo2 = JSON.stringify({ name: "test2" });
        await requestUserApi().put(`/user/3`).send(userInfo1).expect(200);
        await requestUserApi().put(`/user/3`).send(userInfo2).expect(200);

        const response = await requestUserApi().get(`/user/3`);
        expect(response.text).toEqual(userInfo2);
    });

    it('should store relationships between users', async() => {
        const userInfo1 = JSON.stringify({ name: "test1" });
        const userInfo2 = JSON.stringify({ name: "test2" });
        const relationshipInfo = JSON.stringify({ type: "user", id: "5" });
        await requestUserApi().put(`/user/4`).send(userInfo1).expect(200);
        await requestUserApi().put(`/user/5`).send(userInfo2).expect(200);

        await requestUserApi().put(`/user/4/friend`).send(relationshipInfo).expect(200);

        const response = await requestUserApi().get(`/user/4/friend/user/5`);
        expect(response.text).toEqual("{}");
    });

    it('should store relationships between users with properties', async() => {
        const userInfo1 = JSON.stringify({ name: "test1" });
        const userInfo2 = JSON.stringify({ name: "test2" });
        const relationshipInfo = JSON.stringify({ type: "user", id: "7", strength: "best" });
        await requestUserApi().put(`/user/6`).send(userInfo1).expect(200);
        await requestUserApi().put(`/user/7`).send(userInfo2).expect(200);

        await requestUserApi().put(`/user/6/friend`).send(relationshipInfo).expect(200);

        const response = await requestUserApi().get(`/user/6/friend/user/7`);
        expect(response.text).toEqual(JSON.stringify({ strength: "best" }));
    });

    it('should store relationships between users with properties and be able to update those properties', async() => {
        const userInfo1 = JSON.stringify({ name: "test1" });
        const userInfo2 = JSON.stringify({ name: "test2" });
        const relationshipInfo1 = JSON.stringify({ type: "user", id: "7", strength: "best" });
        const relationshipInfo2 = JSON.stringify({ type: "user", id: "7", strength: "acquaintance" });
        await requestUserApi().put(`/user/6`).send(userInfo1).expect(200);
        await requestUserApi().put(`/user/7`).send(userInfo2).expect(200);

        await requestUserApi().put(`/user/6/friend`).send(relationshipInfo1).expect(200);
        await requestUserApi().put(`/user/6/friend`).send(relationshipInfo2).expect(200);

        const response = await requestUserApi().get(`/user/6/friend/user/7`);
        expect(response.text).toEqual(JSON.stringify({ strength: "acquaintance" }));
    });

    it('should store relationships between users with properties and be able to update those properties', async() => {
        const userInfo1 = JSON.stringify({ name: "test1" });
        const userInfo2 = JSON.stringify({ name: "test2" });
        const relationshipInfo1 = JSON.stringify({ type: "user", id: "7", strength: "best" });
        const relationshipInfo2 = JSON.stringify({ type: "user", id: "7", strength: "acquaintance" });
        await requestUserApi().put(`/user/6`).send(userInfo1).expect(200);
        await requestUserApi().put(`/user/7`).send(userInfo2).expect(200);

        await requestUserApi().put(`/user/6/friend`).send(relationshipInfo1).expect(200);
        await requestUserApi().put(`/user/6/friend`).send(relationshipInfo2).expect(200);

        const response = await requestUserApi().get(`/user/6/friend/user/7`);
        expect(response.text).toEqual(JSON.stringify({ strength: "acquaintance" }));
    });

    it('should store relationships between users with properties and be able to get those relationships', async() => {
        const userInfo1 = JSON.stringify({ name: "test1" });
        const userInfo2 = JSON.stringify({ name: "test2" });
        const userInfo3 = JSON.stringify({ name: "test3" });
        const relationshipInfo1 = JSON.stringify({ type: "user", id: "9", strength: "best" });
        const relationshipInfo2 = JSON.stringify({ type: "user", id: "10", strength: "acquaintance" });
        await requestUserApi().put(`/user/8`).send(userInfo1).expect(200);
        await requestUserApi().put(`/user/9`).send(userInfo2).expect(200);
        await requestUserApi().put(`/user/10`).send(userInfo3).expect(200);

        await requestUserApi().put(`/user/8/friend`).send(relationshipInfo1).expect(200);
        await requestUserApi().put(`/user/8/friend`).send(relationshipInfo2).expect(200);

        const expected = [{ id: "9", name: "test2" }, { id: "10", name: "test3" }]

        const response = JSON.parse((await requestUserApi().get(`/user/8/friend`)).text);

        expected.forEach(friend => expect(response).toContainEqual(friend))
        expect(expected.length).toBe(response.length)
    });
});