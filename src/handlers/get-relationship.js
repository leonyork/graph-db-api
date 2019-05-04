'use strict';
const { getRelationship } = require('../repository')

module.exports.handler = async(event) => {
    const fromType = event.pathParameters.fromType.toLowerCase();
    const toType = event.pathParameters.toType.toLowerCase();
    const relationshipType = event.pathParameters.relationshipType.toLowerCase();
    if (!/^[a-z]*$/.test(fromType) || !/^[a-z]*$/.test(toType) || !/^[a-z]*$/.test(relationshipType)) {
        return {
            statusCode: 404,
            body: JSON.stringify({
                message: "Not Found"
            }),
        };
    }

    try {
        const result = await getRelationship(fromType, event.pathParameters.fromId, relationshipType, toType, event.pathParameters.toId)
        if (result == null) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Not Found" })
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify(result)
        }
    } catch (err) {
        console.log(err)
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Internal Server Error"
            })
        }
    }
};