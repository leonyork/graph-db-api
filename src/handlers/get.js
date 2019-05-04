'use strict';
const { get } = require("../repository")

module.exports.handler = async(event) => {
    const type = event.pathParameters.type.toLowerCase();
    if (!/^[a-z]*$/.test(type)) {
        return {
            statusCode: 404,
            body: JSON.stringify({
                message: "Not Found"
            }),
        };
    }

    try {
        const result = await get(type, event.pathParameters.id)
        if (!result) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: "Not Found"
                }),
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
            body: JSON.stringify({ message: `Error getting ${type}` })
        }
    }
};