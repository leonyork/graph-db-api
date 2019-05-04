'use strict';
const { putRelationship } = require('../repository')

module.exports.handler = async(event) => {
    const fromType = event.pathParameters.fromType.toLowerCase();
    const relationshipType = event.pathParameters.relationshipType.toLowerCase();
    if (!/^[a-z]*$/.test(fromType) || !/^[a-z]*$/.test(relationshipType)) {
        return {
            statusCode: 404,
            body: JSON.stringify({
                message: "Not Found"
            }),
        };
    }

    let body;
    try {
        body = JSON.parse(event.body);
    } catch (err) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Body supplied is not JSON data" })
        };
    }

    if (!body.type) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "type not supplied"
            }),
        };
    }
    if (!body.id) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "id not supplied"
            }),
        };
    }
    const toType = body.type.toLowerCase();
    if (!/^[a-z]*$/.test(toType)) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "type is invalid"
            }),
        };
    }

    try {
        const { type, id, ...data } = body
        const result = await putRelationship(fromType, event.pathParameters.fromId, relationshipType, toType, body.id, data)
        if (result == null) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Bad Request" })
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify(result)
        }
    } catch (err) {
        console.log(err)
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Bad Request"
            })
        }
    }
};