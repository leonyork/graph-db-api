'use strict';
const { getRelationships } = require('../repository')

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

    try {
        const result = await getRelationships(fromType, event.pathParameters.fromId, relationshipType)
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